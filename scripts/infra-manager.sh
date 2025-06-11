#!/bin/bash

# ===================================
# ShopMefy Infrastructure Manager
# Local script to control AWS resources
# ===================================

set -e

# Configuration
AWS_REGION="us-east-1"
INSTANCE_ID="i-008b6c493b1f842a9"
FIXED_EIP_ALLOCATION="eipalloc-057707935c2c32dbb"
RDS_INSTANCE_ID="shopmefy-db-b070a7e8"
GITHUB_REPO="gelso/AI4Devs-finalproject"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}🏗️  ShopMefy Infrastructure Manager${NC}"
    echo -e "${BLUE}=================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if AWS CLI is configured
check_aws_config() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI configured correctly"
}

# Get current infrastructure status
get_status() {
    print_info "Checking infrastructure status..."
    
    # EC2 Status
    EC2_STATE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query "Reservations[0].Instances[0].State.Name" --output text --region $AWS_REGION 2>/dev/null || echo "not-found")
    
    # EIP Status
    EIP_STATUS=$(aws ec2 describe-addresses --allocation-ids $FIXED_EIP_ALLOCATION --query "Addresses[0].PublicIp" --output text --region $AWS_REGION 2>/dev/null || echo "not-found")
    
    # RDS Status
    RDS_STATE=$(aws rds describe-db-instances --db-instance-identifier $RDS_INSTANCE_ID --query "DBInstances[0].DBInstanceStatus" --output text --region $AWS_REGION 2>/dev/null || echo "not-found")
    
    # Calculate costs
    MONTHLY_COST=4  # Base cost (EBS + S3 + EIP)
    if [ "$EC2_STATE" = "running" ]; then
        MONTHLY_COST=$((MONTHLY_COST + 15))
    fi
    if [ "$RDS_STATE" = "available" ]; then
        MONTHLY_COST=$((MONTHLY_COST + 13))
    fi
    
    echo ""
    echo -e "${PURPLE}📊 Current Infrastructure Status:${NC}"
    echo -e "   🖥️  EC2 Instance: ${EC2_STATE}"
    echo -e "   🗄️  RDS Database: ${RDS_STATE}"
    echo -e "   🌐 Elastic IP: ${EIP_STATUS}"
    echo -e "   💰 Monthly Cost: ~\$${MONTHLY_COST}"
    echo ""
    
    if [ "$EC2_STATE" = "running" ]; then
        echo -e "${GREEN}🌐 Access URLs:${NC}"
        echo -e "   Frontend: http://${EIP_STATUS}/"
        echo -e "   API: http://${EIP_STATUS}/api"
        echo -e "   Swagger: http://${EIP_STATUS}/api-docs"
        echo -e "   SSH: ssh -i key.pem ubuntu@${EIP_STATUS}"
        echo ""
    fi
}

# Start infrastructure
start_infrastructure() {
    local include_db=${1:-false}
    
    print_header
    print_info "Starting infrastructure..."
    
    if [ "$include_db" = "true" ]; then
        print_warning "Including RDS database (this may take 5-10 minutes)"
        
        if [ "$RDS_STATE" = "stopped" ]; then
            print_info "Starting RDS database..."
            aws rds start-db-instance --db-instance-identifier $RDS_INSTANCE_ID --region $AWS_REGION
            print_info "Waiting for RDS to be available..."
            aws rds wait db-instance-available --db-instance-identifier $RDS_INSTANCE_ID --region $AWS_REGION
            print_success "RDS database started"
        else
            print_success "RDS database already available"
        fi
    fi
    
    if [ "$EC2_STATE" = "stopped" ]; then
        print_info "Starting EC2 instance..."
        aws ec2 start-instances --instance-ids $INSTANCE_ID --region $AWS_REGION
        print_info "Waiting for instance to be running..."
        aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION
        print_success "EC2 instance started"
    else
        print_success "EC2 instance already running"
    fi
    
    print_info "Associating Elastic IP..."
    aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $FIXED_EIP_ALLOCATION --region $AWS_REGION
    print_success "Elastic IP associated"
    
    print_info "Waiting for SSH to be ready..."
    sleep 30
    
    get_status
    print_success "Infrastructure started successfully!"
}

# Stop infrastructure
stop_infrastructure() {
    local include_db=${1:-false}
    
    print_header
    print_info "Stopping infrastructure..."
    
    if [ "$include_db" = "true" ]; then
        print_warning "Including RDS database - application will be completely unavailable!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled"
            exit 0
        fi
        
        if [ "$RDS_STATE" = "available" ]; then
            print_info "Stopping RDS database..."
            aws rds stop-db-instance --db-instance-identifier $RDS_INSTANCE_ID --region $AWS_REGION
            print_info "Waiting for RDS to stop..."
            aws rds wait db-instance-stopped --db-instance-identifier $RDS_INSTANCE_ID --region $AWS_REGION
            print_success "RDS database stopped"
        else
            print_success "RDS database already stopped"
        fi
    fi
    
    if [ "$EC2_STATE" = "running" ]; then
        print_info "Disassociating Elastic IP..."
        ASSOCIATION_ID=$(aws ec2 describe-addresses --allocation-ids $FIXED_EIP_ALLOCATION --query "Addresses[0].AssociationId" --output text --region $AWS_REGION 2>/dev/null || echo "None")
        if [ "$ASSOCIATION_ID" != "None" ] && [ "$ASSOCIATION_ID" != "null" ]; then
            aws ec2 disassociate-address --association-id $ASSOCIATION_ID --region $AWS_REGION
        fi
        
        print_info "Stopping EC2 instance..."
        aws ec2 stop-instances --instance-ids $INSTANCE_ID --region $AWS_REGION
        print_info "Waiting for instance to be stopped..."
        aws ec2 wait instance-stopped --instance-ids $INSTANCE_ID --region $AWS_REGION
        print_success "EC2 instance stopped"
    else
        print_success "EC2 instance already stopped"
    fi
    
    get_status
    
    if [ "$include_db" = "true" ]; then
        print_success "Infrastructure stopped completely! Saving ~$28/month"
    else
        print_success "EC2 stopped! Saving ~$15/month (database still available)"
    fi
}

# Test application health
test_application() {
    print_header
    print_info "Testing application health..."
    
    if [ "$EC2_STATE" != "running" ]; then
        print_error "EC2 instance is not running"
        exit 1
    fi
    
    print_info "Testing frontend..."
    if curl -s -o /dev/null -w "%{http_code}" "http://${EIP_STATUS}/" | grep -q "200"; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
    fi
    
    print_info "Testing API health..."
    if curl -s -o /dev/null -w "%{http_code}" "http://${EIP_STATUS}/api/health" | grep -q "200"; then
        print_success "API is responding"
    else
        print_error "API is not responding"
    fi
    
    print_info "Testing API services..."
    if curl -s -o /dev/null -w "%{http_code}" "http://${EIP_STATUS}/api/services" | grep -q "200"; then
        print_success "API services are responding"
    else
        print_warning "API services may not be fully ready"
    fi
}

# Trigger GitHub Actions
trigger_github_action() {
    local action=$1
    local include_db=${2:-false}
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN environment variable not set"
        print_info "Please set it with: export GITHUB_TOKEN=your_token"
        exit 1
    fi
    
    print_info "Triggering GitHub Action: $action"
    
    local payload="{\"ref\":\"main\",\"inputs\":{\"action\":\"$action\",\"include_database\":\"$include_db\"}}"
    
    curl -X POST \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$GITHUB_REPO/actions/workflows/infra-control.yml/dispatches" \
        -d "$payload"
    
    print_success "GitHub Action triggered"
    print_info "Check progress: https://github.com/$GITHUB_REPO/actions"
}

# Show usage
show_usage() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status                    Show current infrastructure status"
    echo "  start [--with-db]        Start infrastructure (optionally include RDS)"
    echo "  stop [--with-db]         Stop infrastructure (optionally include RDS)"
    echo "  test                     Test application health"
    echo "  github-start [--with-db] Trigger GitHub Actions start"
    echo "  github-stop [--with-db]  Trigger GitHub Actions stop"
    echo "  github-deploy            Trigger GitHub Actions deploy"
    echo "  github-start-deploy      Trigger GitHub Actions start+deploy"
    echo ""
    echo "Options:"
    echo "  --with-db               Include RDS database in start/stop operations"
    echo ""
    echo "Examples:"
    echo "  $0 status               # Check current status"
    echo "  $0 start                # Start EC2 only"
    echo "  $0 start --with-db      # Start EC2 + RDS"
    echo "  $0 stop                 # Stop EC2 only (save ~$15/month)"
    echo "  $0 stop --with-db       # Stop EC2 + RDS (save ~$28/month)"
    echo "  $0 test                 # Test application health"
    echo ""
}

# Main script logic
main() {
    # Check AWS configuration
    check_aws_config
    
    # Get current status
    get_status
    
    # Parse command
    case "${1:-}" in
        "status")
            # Status already shown above
            ;;
        "start")
            include_db="false"
            if [ "$2" = "--with-db" ]; then
                include_db="true"
            fi
            start_infrastructure $include_db
            ;;
        "stop")
            include_db="false"
            if [ "$2" = "--with-db" ]; then
                include_db="true"
            fi
            stop_infrastructure $include_db
            ;;
        "test")
            test_application
            ;;
        "github-start")
            include_db="false"
            if [ "$2" = "--with-db" ]; then
                include_db="true"
            fi
            trigger_github_action "start" $include_db
            ;;
        "github-stop")
            include_db="false"
            if [ "$2" = "--with-db" ]; then
                include_db="true"
            fi
            trigger_github_action "stop" $include_db
            ;;
        "github-deploy")
            trigger_github_action "deploy"
            ;;
        "github-start-deploy")
            trigger_github_action "start-and-deploy"
            ;;
        *)
            show_usage
            ;;
    esac
}

# Run main function
main "$@" 