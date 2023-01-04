#!/bin/bash

export DATABASE_URL=$(aws ssm get-parameter --name "/rentaa/production/database_url" --with-decryption | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')

export SECRET_KEY=$(aws ssm get-parameter --name "/rentaa/production/secret-key" --with-decryption | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')

export APP_PORT=$(aws ssm get-parameter --name "/rentaa/production/app_port" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')

export SENDGRID_API_KEY=$(aws ssm get-parameter --name "/rentaa/production/sendgrid_api_key" --with-decryption | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')

export MIN_PHOTO=$(aws ssm get-parameter --name "/rentaa/production/min_photo" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')

export MAX_PHOTO=$(aws ssm get-parameter --name "/rentaa/production/max_photo" | jq ' .Parameter.Value' | sed -e 's/^"//' -e 's/"$//')
