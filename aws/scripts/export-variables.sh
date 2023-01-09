#!/bin/bash
set -xe

echo "Exporting environment variables..."

DATABASE_URL=$(aws ssm get-parameter --name "/rentaa/production/database_url" --with-decryption | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
SECRET_KEY=$(aws ssm get-parameter --name "/rentaa/production/secret-key" --with-decryption | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
APP_PORT=$(aws ssm get-parameter --name "/rentaa/production/app_port" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
SENDGRID_API_KEY=$(aws ssm get-parameter --name "/rentaa/production/sendgrid_api_key" --with-decryption | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
MIN_PHOTO=$(aws ssm get-parameter --name "/rentaa/production/min_photo" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
MAX_PHOTO=$(aws ssm get-parameter --name "/rentaa/production/max_photo" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
AWS_PUBLIC_BUCKET_NAME=$(aws ssm get-parameter --name "/rentaa/production/gadgets_s3bucket" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')

cd /usr/local/webapps/rentaa

# Create an env file to export variables to
touch .env

echo -e "[Environment Variables]
Application=Rentaa
Description=Rentaa's Environment Variables. All environment variables are
gotten from a central store (SSM). Please note that all environment variables,
if not all, might be regenerated on every deployment. This is sometimes due to 
security measures like key/password rotations. 

[Variables]
DATABASE_URL=$DATABASE_URL
SECRET_KEY=$SECRET_KEY
APP_PORT=$APP_PORT
SENDGRID_API_KEY=$SENDGRID_API_KEY
MIN_PHOTO=$MIN_PHOTO
MAX_PHOTO=$MAX_PHOTO
AWS_PUBLIC_BUCKET_NAME=$AWS_PUBLIC_BUCKET_NAME" > .env
