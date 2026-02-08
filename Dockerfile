# Defines node.js version
FROM node:20

# Defines working dicrectory
WORKDIR /app

# Copies package.json to working directory
COPY package.json .

# Installs dependencies
RUN npm install

# Copies all files to working directory
COPY . .

# Exposes port 3000
EXPOSE 3000

# Starts the application
CMD ["npm", "start"]