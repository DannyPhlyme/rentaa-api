#!/bin/bash
set -xe

cd /usr/local/webapps/rentaa

# Start the application server(pm2 managed)
npm run build:prod
pm2 save
sudo systemctl restart pm2-ubuntu
