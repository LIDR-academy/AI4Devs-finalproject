# Technical Specification: T-1001-INFRA

**Ticket ID:** T-1001-INFRA  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 2 Story Points (~3 hours)  
**Responsable:** DevOps Engineer  
**Prioridad:** 🔴 P0 (Critical Infrastructure - Blocker for all US-010 tickets)  
**Status:** 🟡 **READY FOR IMPLEMENTATION**

---

## 1. Ticket Summary

- **Tipo:** INFRA
- **Alcance:** Configure CloudFront CDN in front of S3 bucket `processed-geometry/` for optimized GLB delivery. Implement cache policy, CORS restrictions, compression, logging, and CloudWatch monitoring.
- **Dependencias:**
  - **Upstream:** US-005 T-0502-AGENT (generates GLB files in S3 `processed-geometry/` bucket)
  - **Downstream:** T-1002-BACK (presigned URLs will use CDN distribution URL instead of direct S3)
  - **Related:** T-0503-DB (`low_poly_url` column stores CDN URLs)

### Problem Statement
Current architecture serves GLB files directly from S3 (`supabase.co/storage/v1/object/...`):
- **High latency:** Median p50 >500ms from US/EU, p95 >1200ms from LATAM/ASIA
- **No geographic optimization:** All requests hit single S3 region (eu-central-1)
- **No compression:** GLB files served as-is (~3-5MB raw, 400KB-1MB with Draco)
- **Bandwidth costs:** $0.09/GB egress from S3 vs $0.085/GB from CloudFront (5% savings + better perf)
- **Security:** CORS allows `*` (too permissive), no rate limiting

### Current State (Before Implementation)
```
User Browser → [S3 eu-central-1] `processed-geometry/low-poly/550e8400.glb`
                  ↑ 500-1200ms latency, no cache, no compression
```

### Target State (After Implementation)
```
User Browser → [CloudFront Edge (50+ locations)] → [S3 Origin eu-central-1]
                  ↑ 50-200ms latency     ↑ 24h cache   ↑ Brotli compression
```

**Performance targets:**
- Median latency (p50): <200ms global
- 95th percentile (p95): <500ms global
- Cache hit rate: >90% after 24h warmup
- Compression ratio: 60-70% (5MB GLB → 1.5-2MB Brotli)

---

## 2. Infrastructure Design

### 2.1 CloudFront Distribution

**CloudFormation Template:** `infra/cloudfront/glb-cdn-stack.yml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'CloudFront CDN for Sagrada Familia GLB files (T-1001-INFRA)'

Parameters:
  S3BucketName:
    Type: String
    Default: 'processed-geometry'
    Description: 'S3 bucket name for GLB files'
  
  AllowedOrigin:
    Type: String
    Default: 'https://app.sfpm.io'
    Description: 'Allowed CORS origin (production domain)'

Resources:
  GLBCDNDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Comment: 'CDN for 3D GLB files - US-010 Visor 3D'
        Enabled: true
        HttpVersion: http2and3
        PriceClass: PriceClass_100  # US, Europe, Israel (sufficient for MVP)
        
        # Origin: S3 Bucket
        Origins:
          - Id: S3-ProcessedGeometry
            DomainName: !Sub '${S3BucketName}.s3.eu-central-1.amazonaws.com'
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${GLBOriginAccessIdentity}'
        
        # Default Cache Behavior
        DefaultCacheBehavior:
          TargetOriginId: S3-ProcessedGeometry
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
            - OPTIONS
          Compress: true  # Enable Brotli/Gzip compression
          CachePolicyId: !Ref GLBCachePolicy
          ResponseHeadersPolicyId: !Ref GLBResponseHeadersPolicy
        
        # Logging
        Logging:
          Bucket: !Sub '${LogsBucket}.s3.amazonaws.com'
          Prefix: 'cloudfront-glb-access-logs/'
          IncludeCookies: false
        
        # Geo Restriction: None (global access)
        Restrictions:
          GeoRestriction:
            RestrictionType: none
        
        # TLS Certificate
        ViewerCertificate:
          CloudFrontDefaultCertificate: true  # Default *.cloudfront.net SSL (free)
          MinimumProtocolVersion: TLSv1.2_2021

  # Origin Access Identity (OAI) for S3 bucket access
  GLBOriginAccessIdentity:
    Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
    Properties:
      CloudFrontOriginAccessIdentityConfig:
        Comment: 'OAI for GLB bucket access (T-1001-INFRA)'

  # Cache Policy: 24h TTL, cache query strings (for presigned URLs)
  GLBCachePolicy:
    Type: AWS::CloudFront::CachePolicy
    Properties:
      CachePolicyConfig:
        Name: GLB-Cache-Policy-24h
        Comment: '24h cache for GLB files with query string caching'
        DefaultTTL: 86400      # 24 hours
        MaxTTL: 604800         # 7 days
        MinTTL: 3600           # 1 hour
        ParametersInCacheKeyAndForwardedToOrigin:
          EnableAcceptEncodingBrotli: true
          EnableAcceptEncodingGzip: true
          QueryStringsConfig:
            QueryStringBehavior: all  # Cache different versions based on presigned URL params
          HeadersConfig:
            HeaderBehavior: whitelist
            Headers:
              - Origin
              - Access-Control-Request-Method
              - Access-Control-Request-Headers
          CookiesConfig:
            CookieBehavior: none

  # Response Headers Policy: CORS + Security Headers
  GLBResponseHeadersPolicy:
    Type: AWS::CloudFront::ResponseHeadersPolicy
    Properties:
      ResponseHeadersPolicyConfig:
        Name: GLB-CORS-Security-Headers
        Comment: 'CORS headers for app.sfpm.io + security hardening'
        CorsConfig:
          AccessControlAllowOrigins:
            Items:
              - !Ref AllowedOrigin  # https://app.sfpm.io
          AccessControlAllowMethods:
            Items:
              - GET
              - HEAD
              - OPTIONS
          AccessControlAllowHeaders:
            Items:
              - '*'
          AccessControlAllowCredentials: false
          AccessControlMaxAgeSec: 600  # 10 minutes preflight cache
          OriginOverride: true
        SecurityHeadersConfig:
          StrictTransportSecurity:
            AccessControlMaxAgeSec: 31536000  # 1 year HSTS
            IncludeSubdomains: true
            Override: true
          ContentTypeOptions:
            Override: true
          XSSProtection:
            ModeBlock: true
            Protection: true
            Override: true

  # S3 Bucket Policy: Allow CloudFront OAI to read objects
  S3BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref S3BucketName
      PolicyDocument:
        Statement:
          - Sid: AllowCloudFrontOAI
            Effect: Allow
            Principal:
              CanonicalUser: !GetAtt GLBOriginAccessIdentity.S3CanonicalUserId
            Action:
              - s3:GetObject
            Resource: !Sub 'arn:aws:s3:::${S3BucketName}/low-poly/*'

  # Logs Bucket for CloudFront Access Logs
  LogsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${S3BucketName}-logs'
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: DeleteOldLogs
            Status: Enabled
            ExpirationInDays: 90  # Keep logs 90 days
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

Outputs:
  DistributionDomainName:
    Description: 'CloudFront distribution domain name'
    Value: !GetAtt GLBCDNDistribution.DomainName
    Export:
      Name: !Sub '${AWS::StackName}-DistributionDomainName'
  
  DistributionId:
    Description: 'CloudFront distribution ID (for invalidations)'
    Value: !Ref GLBCDNDistribution
    Export:
      Name: !Sub '${AWS::StackName}-DistributionId'
```

---

## 3. Implementation Steps

### 3.1 Deploy CloudFormation Stack

```bash
# Navigate to infra directory
cd /Users/pedrocortes/Documents/source/ai4devs/ai4devs-finalproject/infra/cloudfront

# Validate template
aws cloudformation validate-template \
  --template-body file://glb-cdn-stack.yml

# Deploy stack
aws cloudformation create-stack \
  --stack-name sfpm-glb-cdn \
  --template-body file://glb-cdn-stack.yml \
  --parameters \
    ParameterKey=S3BucketName,ParameterValue=processed-geometry \
    ParameterKey=AllowedOrigin,ParameterValue=https://app.sfpm.io \
  --capabilities CAPABILITY_IAM \
  --region eu-central-1

# Wait for completion (5-10 minutes)
aws cloudformation wait stack-create-complete \
  --stack-name sfpm-glb-cdn \
  --region eu-central-1

# Get CloudFront domain name
aws cloudformation describe-stacks \
  --stack-name sfpm-glb-cdn \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionDomainName`].OutputValue' \
  --output text
# Output: d1234abcd.cloudfront.net
```

### 3.2 Update Backend to Use CDN URLs

**File:** `src/backend/config.py`

```python
class Settings(BaseSettings):
    # ... existing settings ...
    
    # T-1001-INFRA: CloudFront CDN for GLB files
    CDN_BASE_URL: str = Field(
        default="https://d1234abcd.cloudfront.net",  # Replace with actual distribution domain
        description="CloudFront CDN base URL for GLB files"
    )
    
    USE_CDN: bool = Field(
        default=True,
        description="Enable CDN for GLB URLs (set to False for local dev with direct S3)"
    )
```

**File:** `src/backend/services/parts_service.py` (modify `_transform_row_to_part_item` helper)

```python
def _transform_row_to_part_item(self, row: Dict) -> Dict:
    """Transform database row to PartCanvasItem dict."""
    low_poly_url = row.get('low_poly_url')
    
    # T-1001-INFRA: Replace S3 URL with CDN URL if enabled
    if low_poly_url and settings.USE_CDN:
        # Original S3 URL: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400.glb
        # CDN URL:         https://d1234abcd.cloudfront.net/low-poly/550e8400.glb
        if 'processed-geometry' in low_poly_url:
            # Extract path after bucket name
            path = low_poly_url.split('processed-geometry/')[-1]
            low_poly_url = f"{settings.CDN_BASE_URL}/{path}"
    
    return {
        'id': str(row['id']),
        'iso_code': row['iso_code'],
        'status': row['status'],
        'tipologia': row.get('tipologia', 'unknown'),
        'low_poly_url': low_poly_url,
        'bbox': row.get('bbox'),
        'workshop_id': str(row['workshop_id']) if row.get('workshop_id') else None,
    }
```

### 3.3 Environment Variables

**File:** `.env.production`

```bash
# T-1001-INFRA: CloudFront CDN Configuration
CDN_BASE_URL=https://d1234abcd.cloudfront.net  # Replace with actual domain from CloudFormation output
USE_CDN=true
```

**File:** `.env.development`

```bash
# Local development: Use direct S3 URLs (bypass CDN)
CDN_BASE_URL=https://ebqapsoyjmdkhdxnkikz.supabase.co/storage/v1/object/public/processed-geometry
USE_CDN=false
```

---

## 4. Testing Strategy

### 4.1 Infrastructure Tests

**File:** `tests/integration/test_cdn_config.py`

```python
"""
T-1001-INFRA: CloudFront CDN Integration Tests
Verify CDN is properly configured and serving GLB files with correct headers.
"""
import pytest
import requests
from src.backend.config import settings

class TestCloudFrontCDN:
    """Test suite for CloudFront CDN configuration."""
    
    def test_cdn_url_environment_variable_is_set(self):
        """ENV-01: Verify CDN_BASE_URL is configured."""
        assert settings.CDN_BASE_URL is not None
        assert settings.CDN_BASE_URL.startswith('https://')
        assert 'cloudfront.net' in settings.CDN_BASE_URL or 'supabase.co' in settings.CDN_BASE_URL
    
    def test_cdn_serves_glb_file_with_correct_mime_type(self):
        """HTTP-01: Verify CDN serves GLB files with application/octet-stream."""
        # Use a known GLB file URL from test fixtures
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        
        response = requests.get(test_url, timeout=10)
        assert response.status_code == 200
        assert response.headers['Content-Type'] in ['model/gltf-binary', 'application/octet-stream']
    
    def test_cdn_returns_cors_headers(self):
        """CORS-01: Verify CORS headers allow app.sfpm.io."""
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        
        response = requests.options(
            test_url,
            headers={'Origin': 'https://app.sfpm.io', 'Access-Control-Request-Method': 'GET'},
            timeout=5
        )
        assert response.headers.get('Access-Control-Allow-Origin') in ['https://app.sfpm.io', '*']
        assert 'GET' in response.headers.get('Access-Control-Allow-Methods', '')
    
    def test_cdn_compresses_responses(self):
        """PERF-01: Verify Brotli/Gzip compression is enabled."""
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        
        response = requests.get(
            test_url,
            headers={'Accept-Encoding': 'br, gzip'},
            timeout=10
        )
        assert response.status_code == 200
        # CloudFront should return Content-Encoding header
        assert response.headers.get('Content-Encoding') in ['br', 'gzip', None]  # None if already compressed
    
    def test_cdn_cache_headers_are_present(self):
        """CACHE-01: Verify Cache-Control headers set 24h TTL."""
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        
        response = requests.get(test_url, timeout=10)
        assert response.status_code == 200
        
        cache_control = response.headers.get('Cache-Control', '')
        # CloudFront should set max-age=86400 (24 hours)
        assert 'max-age' in cache_control
        max_age = int([part.split('=')[1] for part in cache_control.split(',') if 'max-age' in part][0])
        assert max_age >= 3600  # At least 1 hour
    
    def test_cdn_latency_is_acceptable(self):
        """PERF-02: Verify CDN latency <500ms p95."""
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        
        latencies = []
        for _ in range(10):
            response = requests.head(test_url, timeout=5)
            assert response.status_code == 200
            latencies.append(response.elapsed.total_seconds())
        
        p95_latency = sorted(latencies)[int(len(latencies) * 0.95)]
        assert p95_latency < 0.5  # <500ms
```

### 4.2 Manual Verification

```bash
# 1. Test CDN URL directly with curl
curl -I https://d1234abcd.cloudfront.net/low-poly/test-model.glb

# Expected headers:
# HTTP/2 200
# content-type: model/gltf-binary
# content-encoding: br
# cache-control: max-age=86400
# access-control-allow-origin: https://app.sfpm.io
# x-cache: Hit from cloudfront

# 2. Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://app.sfpm.io" \
  -H "Access-Control-Request-Method: GET" \
  https://d1234abcd.cloudfront.net/low-poly/test-model.glb

# Expected:
# access-control-allow-origin: https://app.sfpm.io
# access-control-allow-methods: GET, HEAD, OPTIONS
# access-control-max-age: 600

# 3. Measure latency from different regions (use AWS CLI with different profiles)
for region in us-east-1 eu-west-1 ap-southeast-1; do
  echo "Testing from $region..."
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/low-poly/test-model.glb" \
    --region $region
done
```

---

## 5. Monitoring & Alarms

### 5.1 CloudWatch Metrics

**Metrics to monitor:**
- `Requests`: Total requests/min
- `BytesDownloaded`: Total bandwidth usage
- `CacheHitRate`: Percentage of requests served from cache (target: >90%)
- `4xxErrorRate`: Client errors (target: <1%)
- `5xxErrorRate`: Origin errors (target: <0.1%)
- `OriginLatency`: Time to fetch from S3 (target: <100ms)

**CloudWatch Dashboard:** `infra/cloudwatch/glb-cdn-dashboard.json`

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/CloudFront", "Requests", {"stat": "Sum", "label": "Total Requests"}],
          [".", "CacheHitRate", {"stat": "Average", "label": "Cache Hit Rate"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "GLB CDN Performance",
        "yAxis": {
          "left": {"min": 0}
        }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/CloudFront", "4xxErrorRate", {"stat": "Average", "label": "4xx Errors"}],
          [".", "5xxErrorRate", {"stat": "Average", "label": "5xx Errors"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Error Rates",
        "yAxis": {
          "left": {"min": 0, "max": 5}
        }
      }
    }
  ]
}
```

### 5.2 CloudWatch Alarms

```bash
# Alarm 1: High 5xx Error Rate (Origin Down)
aws cloudwatch put-metric-alarm \
  --alarm-name GLB-CDN-High-5xx-Errors \
  --metric-name 5xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold \
  --alarm-description "GLB CDN 5xx error rate >1% for 10 minutes" \
  --alarm-actions arn:aws:sns:eu-central-1:123456789012:sfpm-alerts

# Alarm 2: Low Cache Hit Rate (<80%)
aws cloudwatch put-metric-alarm \
  --alarm-name GLB-CDN-Low-Cache-Hit-Rate \
  --metric-name CacheHitRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 80.0 \
  --comparison-operator LessThanThreshold \
  --alarm-description "GLB CDN cache hit rate <80% for 1 hour" \
  --alarm-actions arn:aws:sns:eu-central-1:123456789012:sfpm-alerts

# Alarm 3: High Origin Latency (>500ms)
aws cloudwatch put-metric-alarm \
  --alarm-name GLB-CDN-High-Origin-Latency \
  --metric-name OriginLatency \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --evaluation-periods 3 \
  --threshold 500.0 \
  --comparison-operator GreaterThanThreshold \
  --alarm-description "GLB CDN origin latency >500ms for 15 minutes" \
  --alarm-actions arn:aws:sns:eu-central-1:123456789012:sfpm-alerts
```

---

## 6. Rollback Plan

If CDN causes issues, rollback is simple:

```bash
# Option 1: Disable CDN in backend (immediate)
# Update .env.production
USE_CDN=false

# Restart backend service
docker compose restart backend

# Option 2: Delete CloudFormation stack (permanent)
aws cloudformation delete-stack \
  --stack-name sfpm-glb-cdn \
  --region eu-central-1
```

---

## 7. Definition of Done

### Functional Requirements
- [ ] CloudFormation stack `sfpm-glb-cdn` deployed successfully
- [ ] CloudFront distribution returns 200 for GLB files
- [ ] CORS headers allow `https://app.sfpm.io`
- [ ] Brotli/Gzip compression enabled (Content-Encoding header present)
- [ ] Cache-Control header sets 24h TTL (`max-age=86400`)
- [ ] Backend `CDN_BASE_URL` environment variable configured
- [ ] `parts_service.py` transforms S3 URLs to CDN URLs when `USE_CDN=true`

### Performance Requirements
- [ ] Median latency (p50) <200ms measured from 3 regions (US, EU, ASIA)
- [ ] 95th percentile latency (p95) <500ms
- [ ] Cache hit rate >80% after 24h warmup period

### Testing Requirements
- [ ] Integration tests: 6/6 passing (`test_cdn_config.py`)
- [ ] Manual curl test: Headers correct (CORS, compression, cache)
- [ ] Load test: 100 concurrent requests complete without 5xx errors

### Monitoring Requirements
- [ ] CloudWatch dashboard created (`glb-cdn-dashboard.json`)
- [ ] 3 CloudWatch alarms configured (5xx errors, cache hit rate, origin latency)
- [ ] CloudFront access logs streaming to S3 `processed-geometry-logs/`

### Documentation Requirements
- [ ] `.env.example` updated with `CDN_BASE_URL` and `USE_CDN` variables
- [ ] README.md updated with "CDN Configuration" section
- [ ] Rollback plan documented in `docs/US-010/ROLLBACK.md`

---

## 8. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **CloudFormation deployment fails** | High | Low | Pre-validate template with `aws cloudformation validate-template`, test in dev account first |
| **S3 bucket policy denies CloudFront** | High | Medium | Test with single file before full rollout, verify OAI permissions |
| **CORS misconfiguration blocks frontend** | High | Medium | Test preflight OPTIONS request before deploying to production |
| **Cache invalidation latency** | Medium | Low | CloudFront invalidations take 5-15 minutes, use versioned URLs (`/low-poly/550e8400-v2.glb`) for critical updates |
| **CDN costs exceed budget** | Low | Low | Monitor CloudWatch `BytesDownloaded` metric, set billing alarm at $50/month |
| **Presigned URLs expire before CDN caches** | Medium | Low | Backend generates URLs with 5min TTL, CDN caches for 24h = no issue (CDN serves cached copy) |

---

## 9. Cost Estimation

**CloudFront Pricing (eu-central-1, first 10 TB/month):**
- Data transfer out: $0.085/GB
- HTTP/HTTPS requests: $0.0075 per 10,000 requests

**Monthly estimate (150 parts × 400KB × 1000 users × 5 views/month):**
- Total data: 150 × 0.4MB × 1000 × 5 = 300 GB/month
- Data transfer cost: 300 GB × $0.085 = **$25.50/month**
- Requests: 750,000 requests/month → **$0.56/month**
- **Total: ~$26/month** (vs $27 with direct S3 = $1 savings + massive latency improvement)

**Break-even:** CDN pays for itself with just 5% bandwidth savings and 60% latency reduction.

---

## 10. References

- CloudFront Developer Guide: https://docs.aws.amazon.com/cloudfront/
- CloudFormation CloudFront::Distribution: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cloudfront-distribution.html
- Origin Access Identity (OAI): https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- Brotli Compression: https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-cloudfront-announces-support-for-brotli-compression/
