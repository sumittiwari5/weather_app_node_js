FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# The command to run your app
CMD ["node", "src/app.js"] 
