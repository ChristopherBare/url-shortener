output "bucket_name" {
  value = module.s3_website.bucket_name
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.url_shortener.name
}

output "dynamodb_table_arn" {
  value = aws_dynamodb_table.url_shortener.arn
}

output "api_gateway_url" {
  value = "${aws_apigatewayv2_stage.dev.invoke_url}"
}

output "lambda_function_name" {
  value = aws_lambda_function.url_shortener.function_name
}