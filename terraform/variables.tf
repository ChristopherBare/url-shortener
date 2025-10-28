variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for URL shortener"
  type        = string
  default     = "url-shortener-urls"
}
