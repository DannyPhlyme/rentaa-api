#!/bin/bash
set -xe

# Deploy application revision from s3
# Copy compressed artifact file from S3 bucket to webapps/rentaa folder
aws s3 cp s3://rentaastack-rentaawebappdeployments3bucket-15z48osfbdjk/artifact.zip /usr/local/webapps/rentaa/artifact.zip
 
cd /usr/local/webapps/rentaa

# Deploy artifact in webapps folder
unzip artifact.zip
rm -rf artifact.zip

# Install application dependencies
echo "Installing application dependencies..."
yarn install
