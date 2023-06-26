# Base image
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy the rest of the application files
COPY . .

# Set the command to run when a container of this image is started
CMD ["npm", "start"]
