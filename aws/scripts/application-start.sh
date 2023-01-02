#!/bin/bash
set -xe

cd /usr/local/webapps/rentaa

yarn run start:prod

pm2 save
sudo systemctl status pm2-ubuntu
