#!/bin/bash
set -xe

# Copy compressed artifact file from S3 bucket to webapps/rentaa folder
aws s3 cp s3://rentaastack-rentaawebappdeployments3bucket-1gzs4158y4ngl/artifact.zip /usr/local/webapps/rentaa/artifact.zip
 
cd /usr/local/webapps/rentaa

# deploy artifact in webapps folder
unzip artifact.zip
rm -rf artifact.zip

# install application dependencies
yarn install
