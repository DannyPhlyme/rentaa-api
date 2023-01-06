#!/bin/bash
# set -xe

# check status of pm2 process 
# (refer to application stop script)
# systemctl status pm2-ubuntu
pm2_running=$(systemctl is-active pm2-ubuntu)
if [ "$pm2_running" == "inactive" ]; then
    echo "pm2-ubuntu is not running"
fi

# Delete the old directory as needed.
if [ -d /usr/local/webapps ]; then
    rm -rf /usr/local/webapps/
fi

mkdir -vp /usr/local/webapps/rentaa
mkdir -vp /usr/local/webapps/resources