#!/bin/bash
set -xe

cd /usr/local/webapps/rentaa

# Start the application server(pm2 managed)
# start pm2 first
# sudo systemctl start pm2-ubuntu
# yarn run start:prod

# pm2 startup systemd
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# NODE_PORT=3000 pm2 start pm2.yml -n rentaa-app --env production
# pm2 save

pm2 start ./dist/main.js -n rentaa-app

# sudo systemctl restart pm2-ubuntu
