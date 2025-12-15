#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Discord Mirror Bot Setup...${NC}"

# 1. Update System
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Node.js (v20)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Git (if not exists)
echo "Installing Git..."
sudo apt-get install -y git

# 4. Install Dependencies
echo "Installing project dependencies..."
npm install

# 5. Setup Environment Variables
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file...${NC}"
    echo "Please enter your Discord Bot Token:"
    read -r DISCORD_TOKEN
    echo "Please enter your Client ID:"
    read -r CLIENT_ID
    
    echo "DISCORD_TOKEN=$DISCORD_TOKEN" > .env
    echo "CLIENT_ID=$CLIENT_ID" >> .env
    echo ".env file created."
else
    echo ".env file already exists."
fi

# 6. Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# 7. Start Bot with PM2
echo "Starting bot with PM2..."
pm2 start src/index.js --name "discord-mirror-bot"
pm2 save
pm2 startup

echo -e "${GREEN}Setup Complete! Your bot is running.${NC}"
echo "Use 'pm2 logs' to view logs."
echo "Use 'pm2 stop discord-mirror-bot' to stop."
