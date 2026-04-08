#!/bin/bash
set -e

echo "=== Testing Backend Docker Build ==="
cd backend
docker build --no-cache -t test-backend:latest . 2>&1 | tail -50
cd ..

echo ""
echo "=== Testing Frontend Docker Build ==="
cd frontend
docker build --no-cache -t test-frontend:latest . 2>&1 | tail -50
