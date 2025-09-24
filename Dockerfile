# Use an official Node.js runtime as a parent image
FROM node:22.14.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
# A package-lock.json file is required for 'npm ci'
COPY package*.json ./

# Install app dependencies using a clean install for reproducible builds
RUN npm ci

# Bundle app source
COPY . .

# Your app binds to stdin/stdout, so no port is exposed

# Define the command to run your app
CMD ["npm", "start"]
