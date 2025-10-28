module "s3_website" {
  source = "git::https://github.com/ChristopherBare/terraform-modules.git//s3_website"
  website_bucket_name = "url-shortener-bucket"
  index_document      = "index.html"
  error_document      = "error.html"
  origin_id           = "url-short-origin"
}

# DynamoDB Table for URL Shortener
resource "aws_dynamodb_table" "url_shortener" {
  name           = var.dynamodb_table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "generatedKey"

  attribute {
    name = "generatedKey"
    type = "S"
  }

  attribute {
    name = "preferredAlias"
    type = "S"
  }

  # Global Secondary Index for querying by preferred alias
  global_secondary_index {
    name            = "preferredAliasIndex"
    hash_key        = "preferredAlias"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name      = var.dynamodb_table_name
    ManagedBy = "Terraform"
  }
}
