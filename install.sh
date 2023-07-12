#!/bin/bash

# Bash colors
RED="\033[0;31m"
YELLOW="\033[0;33m"

# No color
NO_COLOR="\033[0m"

printf "%b" "$YELLOW → Fetching docker-compose.yml from [ronniery/solid-sniffle] repository...$NO_COLOR\n"
wget -q --show-progress --no-check-certificate https://raw.githubusercontent.com/ronniery/solid-sniffle/master/docker-compose.yml

printf "%b" "$YELLOW → "Running docker compose with the downloaded configuration file..."$NO_COLOR\n"
printf "   %b" "$RED ↪ The container black_in_black will take several minutes. It needs to download MongoDB!$NO_COLOR\n"
docker compose -f ./docker-compose.yml up -d

# Removing the downloaded file
rm ./docker-compose.yml
