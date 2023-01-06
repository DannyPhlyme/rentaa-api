#!/bin/bash
set -x

# System control will return either "active" or "inactive".
pm2_running=$(systemctl is-active pm2-ubuntu)
if [ "$pm2_running" == "active" ]; then
    systemctl stop pm2-ubuntu
fi
