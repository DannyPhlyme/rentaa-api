#!/bin/bash
set -xe

sudo apt install zip -y

# Build and create a dist folder
npm install
npm run build

zip -r artifact.zip dist templates pm2.yml package.json package-lock.json
