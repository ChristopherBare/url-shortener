# Terraform - URL Shortener Infrastructure

Complete infrastructure-as-code setup for URL Shortener POC including:
- DynamoDB table
- Lambda function
- API Gateway
- IAM roles and policies

## Quick Start

### 1. Build Lambda Function

```bash
cd lambda
npm install
npm run build
```

### 2. Deploy with Terraform

```bash
cd terraform
terraform init
terraform import aws_dynamodb_table.url_shortener url-shortener-urls
terraform plan
terraform apply
```

### 3. Get API Endpoint

```bash
terraform output api_gateway_url
# Output: https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### 4. Update Environment Variables

Update `url-shortener/.env`:

```env
VITE_API_URL="https://xxxxx.execute-api.us-east-1.amazonaws.com/dev"
```

## What It Creates

### DynamoDB
- Table: `url-shortener-urls`
- On-demand billing
- Point-in-time recovery enabled
- GSI for alias lookups

### Lambda
- Function: `url-shortener-api`
- Runtime: Node.js 18
- Timeout: 30 seconds
- Auto-scales with demand

### API Gateway
- HTTP API (not REST)
- Auto-deploys on changes
- CORS enabled for development
- Proxy integration to Lambda

### IAM
- Lambda execution role
- DynamoDB read/write permissions
- CloudWatch logs

## Architecture

```
Client
  ↓
API Gateway (HTTP API)
  ↓
Lambda Function (Node.js 18)
  ↓
DynamoDB Table
```

## Files

- `main.tf` - All resources (DynamoDB, Lambda, API Gateway, IAM)
- `variables.tf` - Configuration variables
- `outputs.tf` - API endpoint and other outputs
- `versions.tf` - Terraform version requirements
- `.gitignore` - Ignore sensitive files
- `README.md` - This file

## Outputs

After apply:

```bash
terraform output                    # All outputs
terraform output api_gateway_url    # API endpoint
terraform output lambda_function_name
```

## Configuration

Edit `terraform.tfvars`:

```hcl
dynamodb_table_name = "url-shortener-urls"
```

## Redeploy Lambda

After updating Lambda code:

```bash
cd lambda
npm run build
cd ../terraform
terraform apply
```

## Local Development

For testing without deploying:

```bash
cd lambda
sam local start-api
```

Then update `.env`:
```env
VITE_API_URL="http://localhost:3000"
```

## Monitoring

### Lambda Logs

```bash
aws logs tail /aws/lambda/url-shortener-api --follow
```

### API Gateway Logs

View in CloudWatch console

## Destroy

```bash
terraform destroy
```

⚠️ **Warning**: This deletes DynamoDB table, Lambda, and API Gateway
