# Lambda Function - URL Shortener API

This directory contains the AWS Lambda function that handles all API requests for the URL Shortener application.

## Architecture

```
React App (Frontend)
    ↓ (HTTP requests via fetch)
API Gateway (HTTP API)
    ↓ (AWS_PROXY integration)
Lambda Function (Node.js 18)
    ↓ (AWS SDK)
DynamoDB Table
```

## Setup

### Build the Lambda Function

```bash
cd lambda
npm install
npm run build
```

This creates `terraform/lambda_function.zip` which is deployed by Terraform.

### Deploy with Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

After deployment, Terraform outputs:
- `api_gateway_url` - Your API endpoint
- `lambda_function_name` - Lambda function name

### Update Environment Variables

Update your React app's `.env`:

```env
VITE_API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/dev"
```

## API Endpoints

### GET /urls/{generatedKey}
Retrieve a shortened URL entry.

**Response:**
```json
{
  "generatedKey": "abc12",
  "longURL": "https://example.com/very/long/url",
  "preferredAlias": "mycustom",
  "generatedURL": "https://short.er/mycustom",
  "createdAt": 1698765432000
}
```

### POST /urls
Create a new shortened URL.

**Request:**
```json
{
  "generatedKey": "abc12",
  "longURL": "https://example.com/very/long/url",
  "preferredAlias": "mycustom",
  "generatedURL": "https://short.er/mycustom"
}
```

**Response:**
```json
{
  "message": "URL created successfully",
  "generatedKey": "abc12",
  "generatedURL": "https://short.er/mycustom"
}
```

### GET /urls/check-alias?alias=mycustom
Check if an alias is already taken.

**Response:**
```json
{
  "exists": false
}
```

## Local Development

### Prerequisites
- AWS SAM CLI
- Docker
- Node.js 18+

### Run Locally

```bash
# In the lambda directory
sam local start-api

# Lambda runs on http://localhost:3001
```

Update `.env` in your React app:
```env
VITE_API_URL="http://localhost:3001"
```

### Debug

View Lambda logs:
```bash
aws logs tail /aws/lambda/url-shortener-api --follow
```

## Security

**IAM Permissions:**
The Lambda function has minimal permissions:
- `dynamodb:GetItem` - Fetch URLs
- `dynamodb:PutItem` - Create URLs
- `dynamodb:Query` - Check alias existence
- `logs:*` - Write CloudWatch logs

**CORS:**
Configured to allow all origins for development. For production, restrict to your domain:
```hcl
# In terraform/main.tf
cors_configuration {
  allow_origins = ["https://yourdomain.com"]
  allow_methods = ["GET", "POST"]
  allow_headers = ["Content-Type"]
}
```

## Monitoring

### CloudWatch Logs

```bash
# View all logs
aws logs tail /aws/lambda/url-shortener-api --follow

# Filter errors
aws logs tail /aws/lambda/url-shortener-api --filter "ERROR" --follow
```

### CloudWatch Metrics

Available in AWS Console:
- Invocations
- Errors
- Duration
- Throttles

## Rebuilding

After changes to `index.ts`:

```bash
npm run build
terraform apply  # Redeploys the function
```

## File Structure

- `index.ts` - Lambda handler and business logic
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration
- `build.sh` - Build and package script

## Environment Variables

Available in Lambda:
- `TABLE_NAME` - DynamoDB table name (set by Terraform)
- `AWS_REGION` - AWS region (set by Lambda runtime)

## Cost

**Typical monthly cost:**
- 100k invocations: ~$0.20
- 1M invocations: ~$2.00
- Generous free tier: 1M requests/month

## Troubleshooting

### "Table not found"
- Verify DynamoDB table exists
- Check `TABLE_NAME` environment variable
- Verify Lambda IAM role has DynamoDB permissions

### "CORS error"
- API Gateway CORS is configured
- Ensure you're calling the correct URL
- Check browser console for exact error

### "Alias check failing"
- Verify `preferredAliasIndex` exists on DynamoDB table
- Check Lambda logs for query errors

## Next Steps

1. Build Lambda: `npm run build`
2. Deploy: `cd ../terraform && terraform apply`
3. Update `.env` with API URL
4. Test in React app
