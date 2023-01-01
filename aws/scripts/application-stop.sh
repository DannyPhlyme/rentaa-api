#!/bin/bash
set -x

# System control will return either "active" or "inactive".
pm2_running=$(systemctl is-active pm2-ubuntu)
if [ "$pm2_running" == "active" ]; then
    sudo service pm2-ubuntu stop
fi

# pm2 stop rentaa-app
# pm2 delete rentaa-app
