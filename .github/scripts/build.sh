#!/bin/bash
set -xe

sudo apt install zip -y

# Build and create a dist folder
yarn install
yarn build

zip -r artifact.zip dist templates pm2.yml package.json yarn.lock
