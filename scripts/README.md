# 🏗️ ShopMefy Infrastructure Management

This directory contains scripts and tools for managing the ShopMefy AWS infrastructure with advanced cost optimization features.

## 📋 Overview

The infrastructure management system provides:
- **Cost Optimization**: Save up to 77% on monthly AWS costs
- **Flexible Control**: Start/stop resources independently
- **Safety Features**: Prevent accidental data loss
- **Local & Remote**: Terminal scripts + GitHub Actions
- **Real-time Monitoring**: Status and cost tracking

## 🚀 Quick Start

### 1. Setup
```bash
# Make script executable
chmod +x scripts/infra-manager.sh

# Verify AWS CLI is configured
aws sts get-caller-identity
```

### 2. Check Current Status
```bash
./scripts/infra-manager.sh status
```

### 3. Basic Operations
```bash
# Start EC2 only (recommended for development)
./scripts/infra-manager.sh start

# Stop EC2 only (save ~$11.40/month)
./scripts/infra-manager.sh stop

# Test application health
./scripts/infra-manager.sh test
```

## 💰 Cost Optimization Guide

### Monthly Cost Scenarios

| Scenario | EC2 | RDS | Monthly Cost | Savings |
|----------|-----|-----|--------------|---------|
| **Full Running** | ✅ Running | ✅ Available | ~$32 | - |
| **EC2 Stopped** | ❌ Stopped | ✅ Available | ~$20 | $12 (37%) |
| **Full Stopped** | ❌ Stopped | ❌ Stopped | ~$7 | $25 (77%) |

### Recommended Strategies

#### 🔄 Daily Development
```bash
# Morning: Start for work
./scripts/infra-manager.sh start

# Evening: Stop to save money
./scripts/infra-manager.sh stop
```
**Savings**: ~$11.40/month, database always available

#### 🏖️ Weekend/Vacation
```bash
# Friday: Full shutdown
./scripts/infra-manager.sh stop --with-db

# Monday: Full restart + deploy
./scripts/infra-manager.sh github-start-deploy
```
**Savings**: ~$24.40/month during downtime

#### 🎯 Demo/Presentation
```bash
# Quick activation with deployment
./scripts/infra-manager.sh github-start-deploy

# Status check before demo
./scripts/infra-manager.sh status
```

## 🛠️ Available Commands

### Local Script Commands

| Command | Description | Duration | Cost Impact |
|---------|-------------|----------|-------------|
| `status` | Show current infrastructure status | 30s | None |
| `start` | Start EC2 instance only | 2-3 min | +$15/month |
| `start --with-db` | Start EC2 + RDS database | 5-10 min | +$28/month |
| `stop` | Stop EC2 instance only | 2-3 min | -$11.40/month |
| `stop --with-db` | Stop EC2 + RDS database | 5-10 min | -$24.40/month |
| `test` | Test application health | 30s | None |

### GitHub Actions Integration

| Command | Description |
|---------|-------------|
| `github-start` | Trigger GitHub Actions start |
| `github-stop` | Trigger GitHub Actions stop |
| `github-deploy` | Trigger deployment workflow |
| `github-start-deploy` | Start infrastructure + deploy |

## 🛡️ Safety Features

### Automatic Safety Checks
- ✅ **Database Warning**: Alerts about application downtime
- ✅ **Cost Calculation**: Shows financial impact before actions
- ✅ **Confirmation Prompts**: Requires confirmation for destructive operations
- ✅ **Status Validation**: Checks current state before actions

### Data Protection
- ✅ **Database Persistence**: Data preserved during stop/start cycles
- ✅ **IP Preservation**: Elastic IP maintained during EC2 stop/start
- ✅ **Configuration Persistence**: All settings preserved across restarts
- ✅ **Rollback Capability**: Quick recovery from any state

## 📊 Monitoring & Health Checks

### Status Information
The `status` command provides:
- **EC2 Instance State**: running, stopped, stopping, starting
- **RDS Database State**: available, stopped, stopping, starting
- **Elastic IP**: Current public IP and association status
- **Monthly Cost**: Real-time cost calculation
- **Access URLs**: Direct links to frontend, API, Swagger docs

### Health Check Endpoints
```bash
# Frontend availability
curl http://52.7.57.53/

# API health check
curl http://52.7.57.53/api/health

# API services status
curl http://52.7.57.53/api/services
```

## 🔧 Advanced Usage

### Environment Variables
```bash
# GitHub Actions integration
export GITHUB_TOKEN=your_personal_access_token

# Custom AWS configuration (optional)
export AWS_REGION=us-east-1
export AWS_PROFILE=your-profile
```

### GitHub Actions Workflow
The infrastructure can also be controlled via GitHub Actions:

1. Go to **GitHub Actions** → **🏗️ Start/Stop AWS Infrastructure**
2. Click **Run workflow**
3. Select desired action:
   - `status`: Check current state
   - `start`: Start infrastructure
   - `stop`: Stop infrastructure
   - `start-and-deploy`: Start + deploy in one action
4. Choose whether to include database
5. Run workflow

### Force Actions
For emergency situations, you can bypass safety checks:
- **GitHub Actions**: Set `force_action: true`
- **Local Script**: Use `--force` flag (if implemented)

## 🚨 Emergency Procedures

### Quick Recovery
```bash
# Full infrastructure recovery
./scripts/infra-manager.sh start --with-db

# Health verification
./scripts/infra-manager.sh test
```

### Troubleshooting

#### Script Issues
```bash
# Check AWS CLI configuration
aws sts get-caller-identity

# Verify script permissions
ls -la scripts/infra-manager.sh

# Re-enable execution
chmod +x scripts/infra-manager.sh
```

#### Infrastructure Issues
```bash
# Check current status
./scripts/infra-manager.sh status

# Force restart via GitHub Actions
# (Use force_action: true in workflow)
```

## 📝 Best Practices

### Daily Workflow
1. **Morning**: Check status, start if needed
2. **Development**: Use running infrastructure
3. **Evening**: Stop EC2 to save costs
4. **Weekend**: Consider full stop for maximum savings

### Cost Management
1. **Monitor regularly** using `status` command
2. **Use EC2-only stop** for daily savings
3. **Reserve full stop** for extended downtime
4. **Track monthly costs** and adjust usage patterns

### Safety Guidelines
1. **Always check status first** before making changes
2. **Understand cost implications** of each action
3. **Use confirmation prompts** for destructive operations
4. **Test application health** after infrastructure changes

## 🔗 Related Documentation

- [Infrastructure Workflow Documentation](../prompts/docs/infra-workflow-prompt.md)
- [Deploy Workflow Documentation](../prompts/docs/deploy-workflow.md)
- [GitHub Actions Workflows](../.github/workflows/)
- [Terraform Configuration](../terraform/)

## 📞 Support

For issues or questions:
1. Check the status with `./scripts/infra-manager.sh status`
2. Review the logs in GitHub Actions
3. Consult the troubleshooting section above
4. Contact the development team

---

**💡 Pro Tip**: Use the `status` command regularly to monitor costs and infrastructure state. The script provides real-time cost calculations to help optimize your AWS spending! 