#!/bin/bash
set -xe

cd /usr/local/webapps/rentaa

# Start the application server(pm2 managed)
# start pm2 first
# sudo systemctl start pm2-ubuntu
# yarn run start:prod

pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

yarn run start:prod
pm2 save

# sudo systemctl restart pm2-ubuntu
