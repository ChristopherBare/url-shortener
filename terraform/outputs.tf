output "bucket_name" {
  value = module.s3_website.bucket_name
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.url_shortener.name
}

output "dynamodb_table_arn" {
  value = aws_dynamodb_table.url_shortener.arn
}