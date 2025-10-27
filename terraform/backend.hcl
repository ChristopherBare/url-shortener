bucket         = "terraform-backend-state-url-shortener"
key            = "terraform.tfstate"
region         = "us-east-1"
encrypt        = true
dynamodb_table = "terraform-lock-table-url-shortener"
