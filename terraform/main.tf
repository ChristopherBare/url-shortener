# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "url-shortener-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# IAM Policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.url_shortener.arn,
          "${aws_dynamodb_table.url_shortener.arn}/index/preferredAliasIndex"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "url_shortener" {
  filename      = "lambda_function.zip"
  function_name = "url-shortener-api"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.url_shortener.name
    }
  }

  depends_on = [aws_iam_role_policy.lambda_dynamodb_policy]
}

# API Gateway REST API
resource "aws_apigatewayv2_api" "url_shortener" {
  name          = "url-shortener-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

# API Gateway Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.url_shortener.id
  integration_type = "AWS_PROXY"
  integration_method = "POST"
  payload_format_version = "2.0"
  target = aws_lambda_function.url_shortener.arn
}

# API Gateway Route
resource "aws_apigatewayv2_route" "api_routes" {
  api_id    = aws_apigatewayv2_api.url_shortener.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "dev" {
  api_id      = aws_apigatewayv2_api.url_shortener.id
  name        = "dev"
  auto_deploy = true
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.url_shortener.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.url_shortener.execution_arn}/*/*"
}

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
