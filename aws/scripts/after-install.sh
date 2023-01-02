#!/bin/bash
set -xe

# Copy compressed artifact file from S3 bucket to webapps/rentaa folder
aws s3 cp s3://rentaastack-rentaawebappdeployments3bucket-bab8pq062lqc/artifact.zip /usr/local/webapps/rentaa/artifact.zip
 
cd /usr/local/webapps/rentaa

# deploy artifact in webapps folder
unzip artifact.zip
rm -rf artifact.zip

# install application dependencies
yarn install

sudo systemctl start pm2-ubuntu
sudo systemctl status pm2-ubuntu