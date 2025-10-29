# Deployment Guide - URL Shortener with Lambda & API Gateway

Complete guide to deploy the URL Shortener with Lambda function and API Gateway.

## Architecture Overview

```
┌─────────────────┐
│  React App      │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP Fetch
         ↓
┌─────────────────────────────────────────┐
│     API Gateway (HTTP API)              │
│  - CORS enabled                         │
│  - Auto-deploy                          │
│  - URL: https://xxxxx.execute-api...    │
└────────┬────────────────────────────────┘
         │ AWS_PROXY Integration
         ↓
┌─────────────────────────────────────────┐
│   Lambda Function (Node.js 18)          │
│   - 3 API endpoints                     │
│   - Handles business logic              │
│   - IAM secured                         │
└────────┬────────────────────────────────┘
         │ AWS SDK v3
         ↓
┌─────────────────────────────────────────┐
│    DynamoDB Table                       │
│    - url-shortener-urls                 │
│    - On-demand billing                  │
│    - PITR enabled                       │
└─────────────────────────────────────────┘
```

## Prerequisites

- AWS Account with credentials configured
- Terraform >= 1.5.0
- Node.js 18+
- npm

## Step 1: Build Lambda Function

```bash
cd lambda
npm install
npm run build
```

This creates `terraform/lambda_function.zip` which contains:
- Compiled index.js
- node_modules with AWS SDK
- ~15 MB total size

## Step 2: Initialize Terraform

```bash
cd terraform
terraform init
```

Initialize Terraform backend and download AWS provider.

## Step 3: Import Existing DynamoDB Table

If you already have the DynamoDB table from CLI setup:

```bash
terraform import aws_dynamodb_table.url_shortener url-shortener-urls
```

Otherwise, skip this step and Terraform will create it.

## Step 4: Plan Deployment

```bash
terraform plan
```

Review the plan output. It should show:
- 1 DynamoDB table (new or import)
- 1 Lambda function
- 1 API Gateway
- 1 IAM role
- 1 IAM policy
- 2 Lambda permissions

## Step 5: Apply Configuration

```bash
terraform apply
```

Confirm the changes. Deployment takes ~2-3 minutes.

## Step 6: Get API Endpoint

```bash
terraform output api_gateway_url
```

Output will be something like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

Copy this URL.

## Step 7: Update React App Configuration

Edit `url-shortener/.env`:

```env
# API Gateway endpoint (from step 6)
VITE_API_URL="https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev"
```

## Step 8: Test the Application

```bash
cd url-shortener
npm run dev
```

Open http://localhost:5173 and test:
1. Create a short URL
2. Create a URL with custom alias
3. Verify URL redirection

## Verification Checklist

- [ ] Lambda function exists in AWS Console
- [ ] API Gateway shows endpoints
- [ ] DynamoDB table has data
- [ ] React app can create URLs
- [ ] React app can redirect to original URLs
- [ ] Lambda logs appear in CloudWatch

## Monitoring

### View Lambda Logs

```bash
aws logs tail /aws/lambda/url-shortener-api --follow
```

### Check Lambda Performance

AWS Console → Lambda → url-shortener-api → Monitor tab

### View API Calls

AWS Console → API Gateway → url-shortener-api → Stages → dev

## Cost Estimate (Monthly)

- **DynamoDB**: $0.30-0.50 (low usage)
- **Lambda**: $0.20 (100k invocations)
- **API Gateway**: $0.35 (1M requests free)
- **Total**: ~$1.00/month (for dev POC)

## Troubleshooting

### "Lambda function not created"
- Check build.sh ran successfully
- Verify lambda_function.zip exists
- Check IAM permissions

### "API Gateway CORS errors"
- CORS is configured in Terraform
- Check browser console for exact error
- Verify API URL is correct

### "DynamoDB table not found"
- Verify table name in outputs
- Check table exists in DynamoDB console
- Verify IAM policy is attached to Lambda

### "Alias already exists error but it doesn't"
- Check preferredAliasIndex exists on table
- Verify Lambda has Query permission
- Check CloudWatch logs

## Updating Lambda Code

1. Edit `lambda/index.ts`
2. Rebuild: `cd lambda && npm run build`
3. Deploy: `cd ../terraform && terraform apply`

## Redeploy Infrastructure

```bash
cd terraform
terraform apply
```

Terraform will detect changes and redeploy only what changed.

## Cleanup

⚠️ **Warning**: This deletes all infrastructure and DynamoDB data!

```bash
cd terraform
terraform destroy
```

## Next Steps

1. Set up monitoring/alarms
2. Add rate limiting
3. Add API authentication
4. Set up CI/CD pipeline
5. Deploy to production

## Support & Debugging

### Check Terraform State

```bash
terraform show
```

### Validate Terraform

```bash
terraform validate
```

### Format Terraform

```bash
terraform fmt -recursive
```

### View All Outputs

```bash
terraform output -json
```

## Security Notes

- Lambda runs with minimal IAM permissions
- DynamoDB is accessed only through Lambda
- API Gateway has CORS enabled (development only)
- Consider adding API Key or authentication for production
- Enable WAF for API Gateway in production

## Local Development

To test Lambda locally without AWS:

```bash
cd lambda
sam local start-api
```

Then in React app:
```env
VITE_API_URL="http://localhost:3000"
```

## Files Created/Modified

**New Files:**
- `lambda/index.ts` - Lambda handler
- `lambda/package.json` - Dependencies
- `lambda/tsconfig.json` - TypeScript config
- `lambda/build.sh` - Build script
- `lambda/README.md` - Lambda documentation

**Modified Files:**
- `terraform/main.tf` - Added Lambda, API Gateway, IAM
- `terraform/outputs.tf` - Added API endpoint output
- `url-shortener/src/services/dynamodb.ts` - Now calls API
- `url-shortener/.env` - Updated with API URL

**Documentation:**
- `DEPLOYMENT_GUIDE.md` - This file
- `terraform/README.md` - Updated with Lambda steps

## Quick Reference

```bash
# Build everything
cd lambda && npm run build && cd ../terraform

# Deploy
terraform apply

# Get endpoint
terraform output api_gateway_url

# Test
cd ../url-shortener && npm run dev

# Monitor
aws logs tail /aws/lambda/url-shortener-api --follow

# Cleanup
terraform destroy
```
