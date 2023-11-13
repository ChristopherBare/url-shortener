module "s3_website" {
  source = "github.com/ChristopherBare/terraform-modules"
  website_bucket_name     = "url-shortener-bucket"
  index_document          = "index.html"
  error_document          = "error.html"
  origin_id               = "url-short-origin"
}

