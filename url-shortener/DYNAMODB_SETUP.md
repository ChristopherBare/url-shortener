# DynamoDB Setup Guide

This project has been converted from Supabase to AWS DynamoDB. Follow these steps to set up your DynamoDB table and configure the application.

## Prerequisites

- AWS Account
- AWS CLI configured with credentials
- Node.js and npm installed

## Step 1: Create DynamoDB Table

You can create the table using AWS CLI or the AWS Console.

### Option A: Using AWS CLI

```bash
aws dynamodb create-table \
  --table-name url-shortener-urls \
  --attribute-definitions \
    AttributeName=generatedKey,AttributeType=S \
    AttributeName=preferredAlias,AttributeType=S \
  --key-schema \
    AttributeName=generatedKey,KeyType=HASH \
  --global-secondary-indexes \
    '[{
      "IndexName": "preferredAliasIndex",
      "KeySchema": [
        {"AttributeName": "preferredAlias", "KeyType": "HASH"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }]' \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### Option B: Using AWS Console

1. Go to AWS DynamoDB Dashboard
2. Click "Create table"
3. Table name: `url-shortener-urls`
4. Partition key: `generatedKey` (String)
5. Enable "Add Global Secondary Index"
6. GSI settings:
   - Partition key: `preferredAlias` (String)
   - Index name: `preferredAliasIndex`
   - Read/Write: On-demand or provisioned (5/5 for testing)
7. Create table

## Step 2: Configure Environment Variables

Update the `.env` file in the `url-shortener` directory with your AWS credentials:

```env
VITE_AWS_REGION="us-east-1"
VITE_AWS_ACCESS_KEY_ID="your-access-key-id"
VITE_AWS_SECRET_ACCESS_KEY="your-secret-access-key"
VITE_DYNAMODB_TABLE_NAME="url-shortener-urls"
```

### Finding Your Credentials

1. Go to IAM Console
2. Create a new user or use existing one
3. Create an access key (Access Key ID and Secret Access Key)
4. Ensure the user has DynamoDB permissions

### Recommended IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/url-shortener-urls",
        "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/url-shortener-urls/index/preferredAliasIndex"
      ]
    }
  ]
}
```

## Step 3: Install Dependencies

```bash
cd url-shortener
npm install
```

## Step 4: Run the Application

```bash
npm run dev
```

## DynamoDB Table Schema

### Main Table: `url-shortener-urls`

**Partition Key:** `generatedKey` (String)

**Attributes:**
- `generatedKey` (String, HASH Key): Unique identifier for the short URL (either random or user-provided alias)
- `longURL` (String): The original long URL to redirect to
- `preferredAlias` (String): Optional user-provided alias
- `generatedURL` (String): The full shortened URL
- `createdAt` (Number): Timestamp when the URL was created

**Global Secondary Index:** `preferredAliasIndex`
- **Partition Key:** `preferredAlias`
- **Purpose:** Query URLs by preferred alias to check for duplicates

## Monitoring and Cost Optimization

### Monitor Usage

```bash
aws dynamodb describe-table --table-name url-shortener-urls --region us-east-1
```

### Cost Considerations

- **On-demand billing**: Good for variable traffic, pay per request
- **Provisioned billing**: Good for predictable traffic, fixed hourly cost
- **Storage**: $1.25 per GB per month

To switch to on-demand billing (more cost-effective for low traffic):

```bash
aws dynamodb update-billing-mode \
  --table-name url-shortener-urls \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Troubleshooting

### Connection Issues

- Verify AWS credentials in `.env`
- Check IAM permissions
- Ensure DynamoDB table is in the correct region

### Query Issues

- Make sure `preferredAliasIndex` exists if checking aliases
- Verify table has data
- Check CloudWatch logs for errors

## Migration from Supabase

If you have existing data in Supabase:

1. Export data from Supabase PostgreSQL
2. Transform data to match DynamoDB schema
3. Use AWS DynamoDB batch write to import
4. Verify all URLs are accessible

## Security Notes

**IMPORTANT:** Never commit your `.env` file with real credentials to version control. Use environment variables in production.

For production deployments:
- Use AWS Lambda for API calls instead of client-side calls
- Implement API Gateway for rate limiting
- Use IAM roles instead of access keys when possible
- Enable encryption at rest and in transit
