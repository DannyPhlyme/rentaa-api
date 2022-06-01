FROM node:10-alpine

# Install PM2
RUN npm install -g pm2

# Create our working directory
RUN mkdir -p /var/app/rentaa

# Set working directory
WORKDIR /var/app/rentaa

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /var/app/rentaa/node_modules/.bin:$PATH

# Create a user with no password
RUN adduser --disabled-password root

# Copy existing application directory contents
COPY . /var/app/rentaa

# Install and cache app dependencies
COPY package.json /var/app/rentaa/package.json
COPY package-lock.json /var/app/rentaa/package-lock.json

# Grant permission to the application
RUN chown -R root:root /var/app/rentaa
USER root

# Clear application caching
RUN npm cache clean --force

# Install all dependencies
RUN npm install

# Expose port 3002
EXPOSE 3002

# start run in production environment
#CMD [ "npm", "run", "pm2:delete" ]
#CMD [ "npm", "run", "build-docker:dev" ]

# Start run in development environment
CMD [ "npm", "run", "start:dev" ]