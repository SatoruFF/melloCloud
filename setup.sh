#!/bin/bash

# Ensure the script is run with root privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run the script as root (sudo)"
  exit
fi

echo "Updating package list..."
apt-get update && apt-get upgrade -y

echo "Installing dependencies for Docker..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

echo "Adding Docker's official GPG key..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

echo "Adding Docker repository..."
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

echo "Updating package list after adding Docker repository..."
apt-get update

echo "Installing Docker CE..."
apt-get install -y docker-ce

echo "Verifying Docker installation..."
docker --version
if [ $? -ne 0 ]; then
  echo "Error installing Docker"
  exit 1
fi

echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "Verifying Docker Compose installation..."
docker-compose --version
if [ $? -ne 0 ]; then
  echo "Error installing Docker Compose"
  exit 1
fi

echo "Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

echo "Verifying PostgreSQL installation..."
psql --version
if [ $? -ne 0 ]; then
  echo "Error installing PostgreSQL"
  exit 1
fi

echo "Installing Git..."
apt-get install -y git

echo "Verifying Git installation..."
git --version
if [ $? -ne 0 ]; then
  echo "Error installing Git"
  exit 1
fi

echo "Installing Certbot for SSL certificates..."
apt-get install -y certbot python3-certbot-nginx

echo "Verifying Certbot installation..."
certbot --version
if [ $? -ne 0 ]; then
  echo "Error installing Certbot"
  exit 1
fi

echo ""
echo "=== Arcane (Docker management + auto-updates) ==="
echo "Before first 'docker compose up', generate Arcane secrets:"
echo "  docker run --rm ghcr.io/getarcaneapp/arcane:latest /app/arcane generate secret"
echo "Add output to .env, plus: ARCANE_APP_URL=https://arcane.mellocloud.net"
echo "In Arcane UI: Registry Credentials -> ghcr.io (GitHub PAT); enable Auto Updates (~5 min)."
echo ""

echo "All components have been successfully installed!"