#!/bin/bash

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Discord Mirror Bot (Python) Setup...${NC}"

# 1. Update System
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Python 3 and pip
echo "Installing Python 3 and pip..."
sudo apt-get install -y python3 python3-pip python3-venv git

# 3. Install PM2 (Process Manager)
echo "Installing PM2..."
# PM2 requires Node.js/npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 4. Install Dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt --break-system-packages

# 5. Setup Environment Variables
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file...${NC}"
    echo "Please enter your Discord Bot Token:"
    read -r DISCORD_TOKEN
    
    echo "DISCORD_TOKEN=$DISCORD_TOKEN" > .env
    echo ".env file created."
else
    echo ".env file already exists."
fi

# 6. Check for mapping.json
if [ ! -f mapping.json ]; then
    echo -e "${GREEN}mapping.json not found!${NC}"
    echo "You need to run 'python3 setup_bot.py' first to generate the channel mapping."
    echo "Or upload your local mapping.json to this server."
fi

# 7. Start Bot with PM2
echo "Starting mirror_bot.py with PM2..."
# Start python script with PM2
pm2 start mirror_bot.py --interpreter python3 --name "discord-mirror-python"
pm2 save
pm2 startup

echo -e "${GREEN}Setup Complete! Your bot is running 24/7.${NC}"
echo "Use 'pm2 logs' to view logs."
echo "Use 'pm2 stop discord-mirror-python' to stop."
