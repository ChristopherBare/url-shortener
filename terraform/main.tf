module "s3_website" {
  source              = "github.com/ChristopherBare/terraform-modules/s3_website"
  website_bucket_name = "url-shortener-bucket"
  index_document      = "index.html"
  error_document      = "error.html"
  origin_id           = "url-short-origin"
}

resource "null_resource" "upload_files" {
  provisioner "local-exec" {
    command = "aws s3 cp ../url-shortener/dist s3://${module.s3_website.bucket_name}/ --recursive"
  }
  depends_on = [module.s3_website]
}
