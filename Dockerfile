FROM node:16-alpine3.14

# Install PM2
RUN npm install -g pm2

# # Create our working directory
# RUN mkdir -p /var/app/rentaa

# # Set working directory
# WORKDIR /var/app/rentaa

# # Add `/usr/src/app/node_modules/.bin` to $PATH
# ENV PATH /var/app/rentaa/node_modules/.bin:$PATH

# Create a user(rentaa-admin) with no password
RUN adduser --disabled-password rentaa-admin

# Create our working directory
RUN mkdir -p /home/rentaa-admin/rentaa-app

# Set working directory
WORKDIR /home/rentaa-admin/rentaa-app

# RUN rm -rf node_modules package-lock.json
RUN rm -rf node_modules

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /home/rentaa-admin/rentaa-app/node_modules/.bin:$PATH

# Copy existing application directory contents
COPY . /home/rentaa-admin/rentaa-app

# Install and cache app dependencies
COPY package.json /home/rentaa-admin/rentaa-app/package.json
COPY package-lock.json /home/rentaa-admin/rentaa-app/package-lock.json

# Grant permission to the application
RUN chown -R rentaa-admin:rentaa-admin /home/rentaa-admin/rentaa-app
USER rentaa-admin

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