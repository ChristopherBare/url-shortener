#!/bin/bash

# Build script for Lambda function

set -e

echo "Building Lambda function..."

# Install dependencies
npm install

# Compile TypeScript to JavaScript
npx tsc index.ts --target es2020 --module commonjs --declaration false

# Create zip file
rm -f lambda_function.zip
zip -r lambda_function.zip index.js node_modules/

# Move zip to terraform directory
mv lambda_function.zip ../terraform/

echo "Lambda function packaged to terraform/lambda_function.zip"
