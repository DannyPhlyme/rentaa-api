#!/bin/bash
set -xe

# Delete the old directory as needed.
if [ -d /usr/local/webapps ]; then
    rm -rf /usr/local/webapps/
fi

mkdir -vp /usr/local/webapps/rentaa
mkdir -vp /usr/local/webapps/resources
