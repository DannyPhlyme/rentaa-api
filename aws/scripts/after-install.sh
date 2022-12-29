#!/bin/bash
set -xe

# Copy compressed artifact file from S3 bucket to webapps/rentaa folder
aws s3 cp s3://rentaastack-rentaawebappdeployments3bucket-4pf3yd3ozk8/artifact.zip /usr/local/webapps/rentaa/artifact.zip
 
cd /usr/local/webapps/rentaa

# deploy artifact in webapps folder
unzip artifact.zip
rm -rf artifact.zip
rm -rf package-lock.json
rm -rf node_modules

# install application dependencies 
npm install --legacy-peer-deps
