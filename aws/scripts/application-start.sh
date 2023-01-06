#!/bin/bash
set -xe

# test that this script can use sudo command to start
# pm2 as user ubuntu
sudo systemctl start pm2-ubuntu

cd /usr/local/webapps/rentaa

yarn run start:prod

pm2 save
systemctl status pm2-ubuntu
