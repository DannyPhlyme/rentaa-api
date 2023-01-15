#!/bin/bash
set -xe

# Start pm2 process
sudo systemctl start pm2-ubuntu

cd /usr/local/webapps/rentaa

yarn start:prod

pm2 save
systemctl status pm2-ubuntu
