# Terraform - URL Shortener DynamoDB

Simple Terraform configuration for the URL Shortener development POC.

## Quick Start

```bash
cd terraform
terraform init
terraform import aws_dynamodb_table.url_shortener url-shortener-urls
terraform plan
terraform apply
```

## What It Does

Creates a DynamoDB table with:
- **Table**: `url-shortener-urls`
- **Primary Key**: `generatedKey` (String)
- **GSI**: `preferredAliasIndex` on `preferredAlias` for alias lookups
- **Billing**: On-demand (PAY_PER_REQUEST)
- **Backup**: Point-in-time recovery enabled

## Files

- `main.tf` - DynamoDB table resource
- `variables.tf` - Table name variable (optional)
- `outputs.tf` - Table name and ARN outputs
- `versions.tf` - Terraform version requirements
- `terraform.tfvars.example` - Example configuration

## Outputs

After apply, get outputs:

```bash
terraform output dynamodb_table_name
terraform output dynamodb_table_arn
```

## Configuration

Edit `terraform.tfvars` to customize table name:

```hcl
dynamodb_table_name = "url-shortener-urls"
```

## Destroy

```bash
terraform destroy
```

⚠️ **Warning**: This deletes the DynamoDB table and all data.
