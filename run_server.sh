#!/bin/bash

# Spanish Liga Pattern Prediction API - Server Launcher

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Spanish Liga Pattern Prediction API...${NC}"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -q -r requirements.txt
else
    source venv/bin/activate
fi

# Check if data file exists
if [ ! -f "data/spanish_league_patterns.json" ]; then
    echo -e "${YELLOW}Warning: Pattern data file not found at data/spanish_league_patterns.json${NC}"
    exit 1
fi

echo -e "${GREEN}Starting server on http://0.0.0.0:8000${NC}"
echo -e "${GREEN}API Documentation: http://localhost:8000/docs${NC}"
echo -e "${GREEN}Press Ctrl+C to stop${NC}"
echo ""

# Run the server
python main.py
