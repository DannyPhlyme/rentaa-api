#!/bin/bash
set -xe

# deploy application revision from s3
# Copy compressed artifact file from S3 bucket to webapps/rentaa folder
aws s3 cp s3://rentaastack-rentaawebappdeployments3bucket-15z48osfbdjk/artifact.zip /usr/local/webapps/rentaa/artifact.zip
 
cd /usr/local/webapps/rentaa

# deploy artifact in webapps folder
unzip artifact.zip
rm -rf artifact.zip

# install application dependencies
yarn install

# sudo systemctl start pm2-ubuntu
# systemctl status pm2-ubuntu
pm2_running=$(systemctl is-active pm2-ubuntu)
if [ "$pm2_running" == "inactive" ]; then
    echo "pm2-ubuntu is not running"
fi
