#!/bin/bash

# Comprehensive deployment monitoring and testing script
# Usage: ./scripts/monitor-and-execute.sh

set -e

echo "🔍 Starting comprehensive deployment verification..."

# Configuration
SERVER_IP="52.7.57.53"
MAX_WAIT_TIME=300  # 5 minutes
CHECK_INTERVAL=15  # 15 seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check backend process via SSH
check_backend_process() {
    log "Checking backend process via SSH..."
    
    local process_info=$(ssh ubuntu@${SERVER_IP} "ps aux | grep 'node dist/src/index.js' | grep -v grep" 2>/dev/null || echo "")
    
    if [ -z "$process_info" ]; then
        error "Backend process not running"
        return 1
    fi
    
    local cpu_usage=$(echo "$process_info" | awk '{print $3}')
    local memory_usage=$(echo "$process_info" | awk '{print $4}')
    local pid=$(echo "$process_info" | awk '{print $2}')
    
    log "Backend process PID: $pid, CPU: ${cpu_usage}%, Memory: ${memory_usage}%"
    
    # Check if CPU usage is reasonable (less than 20%)
    local cpu_int=$(echo "$cpu_usage" | cut -d'.' -f1)
    if [ "$cpu_int" -lt 20 ]; then
        success "Backend process running with normal CPU usage"
        return 0
    else
        warning "Backend process has high CPU usage: ${cpu_usage}%"
        return 1
    fi
}

# Function to check frontend process via SSH
check_frontend_process() {
    log "Checking frontend process via SSH..."
    
    local process_info=$(ssh ubuntu@${SERVER_IP} "ps aux | grep 'serve -s dist -l 3000' | grep -v grep" 2>/dev/null || echo "")
    
    if [ -z "$process_info" ]; then
        error "Frontend process not running"
        return 1
    fi
    
    local pid=$(echo "$process_info" | awk '{print $2}')
    log "Frontend process PID: $pid"
    success "Frontend process running"
    return 0
}

# Function to test backend health via SSH curl
test_backend_health() {
    log "Testing backend health via SSH curl..."
    
    local health_response=$(ssh ubuntu@${SERVER_IP} "curl -s -m 10 -w 'HTTPSTATUS:%{http_code}' http://localhost:8080/api/health" 2>/dev/null || echo "HTTPSTATUS:000")
    
    local http_status=$(echo "$health_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    local response_body=$(echo "$health_response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        success "Backend health check passed: $response_body"
        return 0
    else
        error "Backend health check failed (HTTP $http_status)"
        return 1
    fi
}

# Function to test frontend via SSH curl
test_frontend_access() {
    log "Testing frontend access via SSH curl..."
    
    local frontend_response=$(ssh ubuntu@${SERVER_IP} "curl -s -m 10 -w 'HTTPSTATUS:%{http_code}' http://localhost:3000" 2>/dev/null || echo "HTTPSTATUS:000")
    
    local http_status=$(echo "$frontend_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$http_status" = "200" ]; then
        success "Frontend access test passed"
        return 0
    else
        error "Frontend access test failed (HTTP $http_status)"
        return 1
    fi
}

# Function to test login API via SSH curl
test_login_api() {
    log "Testing login API via SSH curl..."
    
    local login_response=$(ssh ubuntu@${SERVER_IP} "curl -s -m 15 -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"ShopMefy2024\"}' -w 'HTTPSTATUS:%{http_code}'" 2>/dev/null || echo "HTTPSTATUS:000")
    
    local http_status=$(echo "$login_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    local response_body=$(echo "$login_response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        success "Login API test passed!"
        log "Response: $response_body"
        return 0
    else
        error "Login API test failed (HTTP $http_status)"
        log "Response: $response_body"
        return 1
    fi
}

# Function to test external access (from outside)
test_external_access() {
    log "Testing external access to application..."
    
    # Test frontend from outside
    local frontend_status=$(curl -s -o /dev/null -w "%{http_code}" -m 10 http://${SERVER_IP}/ 2>/dev/null || echo "000")
    if [ "$frontend_status" = "200" ]; then
        success "External frontend access working"
    else
        error "External frontend access failed (HTTP $frontend_status)"
        return 1
    fi
    
    # Test backend API from outside
    local backend_status=$(curl -s -o /dev/null -w "%{http_code}" -m 10 http://${SERVER_IP}/api/health 2>/dev/null || echo "000")
    if [ "$backend_status" = "200" ]; then
        success "External backend API access working"
    else
        error "External backend API access failed (HTTP $backend_status)"
        return 1
    fi
    
    return 0
}

# Function to verify deployed code doesn't have checkTestPassword
verify_deployed_code() {
    log "Verifying deployed code doesn't contain checkTestPassword..."
    
    local has_old_code=$(ssh ubuntu@${SERVER_IP} "cd shopmefy-deployment/backend && grep -c 'checkTestPassword' dist/src/controllers/auth.controller.js 2>/dev/null || echo '0'")
    
    if [ "$has_old_code" = "0" ]; then
        success "Deployed code is clean (no checkTestPassword found)"
        return 0
    else
        error "Deployed code still contains checkTestPassword!"
        return 1
    fi
}

# Main comprehensive test function
run_comprehensive_tests() {
    log "🧪 Running comprehensive tests..."
    
    local all_passed=true
    
    # Test 1: Backend process
    if ! check_backend_process; then
        all_passed=false
    fi
    
    # Test 2: Frontend process
    if ! check_frontend_process; then
        all_passed=false
    fi
    
    # Test 3: Verify clean code
    if ! verify_deployed_code; then
        all_passed=false
    fi
    
    # Test 4: Backend health
    if ! test_backend_health; then
        all_passed=false
    fi
    
    # Test 5: Frontend access
    if ! test_frontend_access; then
        all_passed=false
    fi
    
    # Test 6: Login API
    if ! test_login_api; then
        all_passed=false
    fi
    
    # Test 7: External access
    if ! test_external_access; then
        all_passed=false
    fi
    
    if [ "$all_passed" = true ]; then
        success "🎉 ALL TESTS PASSED! Frontend and Backend are working correctly!"
        success "🌐 Application is fully functional at http://${SERVER_IP}"
        return 0
    else
        error "❌ Some tests failed. Application needs attention."
        return 1
    fi
}

# Main execution
main() {
    log "🚀 Starting comprehensive deployment verification..."
    log "Server: $SERVER_IP"
    
    # Run tests immediately
    if run_comprehensive_tests; then
        success "✅ Deployment verification completed successfully!"
        exit 0
    else
        error "❌ Deployment verification failed!"
        exit 1
    fi
}

# Run main function
main "$@" 