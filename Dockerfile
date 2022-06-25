# Image
FROM node:16

# Working Directory
WORKDIR /usr/src/app

# App Source
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Redis
EXPOSE 6379

# Start command
CMD [ "npm", "run", "start" ]