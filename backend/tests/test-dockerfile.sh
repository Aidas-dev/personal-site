#!/bin/bash
# Test script to validate Backend Dockerfile

set -e

echo "=== Backend Dockerfile Validation Tests ==="

# Test 1: Dockerfile exists
echo "Test 1: Checking Dockerfile exists..."
if [ -f "backend/Dockerfile" ]; then
    echo "✅ PASS: Dockerfile exists"
else
    echo "❌ FAIL: Dockerfile not found"
    exit 1
fi

# Test 2: Multi-stage build (should have at least 2 FROM statements)
echo "Test 2: Checking multi-stage build..."
FROM_COUNT=$(grep -c "^FROM" backend/Dockerfile)
if [ "$FROM_COUNT" -ge 2 ]; then
    echo "✅ PASS: Multi-stage build detected ($FROM_COUNT stages)"
else
    echo "❌ FAIL: Expected at least 2 FROM statements, found $FROM_COUNT"
    exit 1
fi

# Test 3: Node.js 24 LTS base image
echo "Test 3: Checking Node.js version..."
if grep -q "node:24" backend/Dockerfile; then
    echo "✅ PASS: Node.js 24 base image found"
else
    echo "❌ FAIL: Node.js 24 base image not found"
    exit 1
fi

# Test 4: npm configured for dependency installation
echo "Test 4: Checking npm configuration..."
if grep -q "npm" backend/Dockerfile; then
    echo "✅ PASS: npm configuration found"
else
    echo "❌ FAIL: npm not configured"
    exit 1
fi

# Test 5: Production dependencies only
echo "Test 5: Checking production-only dependencies..."
if grep -q "\-\-omit=dev\|\-\-production" backend/Dockerfile; then
    echo "✅ PASS: Production-only dependencies configured"
else
    echo "❌ FAIL: Production-only dependencies not configured"
    exit 1
fi

# Test 6: Health check configured
echo "Test 6: Checking health check..."
if grep -q "HEALTHCHECK" backend/Dockerfile; then
    echo "✅ PASS: Health check configured"
else
    echo "❌ FAIL: Health check not configured"
    exit 1
fi

# Test 7: Medusa build command
echo "Test 7: Checking Medusa build command..."
if grep -q "medusa build\|npm run build\|pnpm run build" backend/Dockerfile; then
    echo "✅ PASS: Medusa build command found"
else
    echo "❌ FAIL: Medusa build command not found"
    exit 1
fi

# Test 8: Production environment set
echo "Test 8: Checking NODE_ENV..."
if grep -q "NODE_ENV=production" backend/Dockerfile; then
    echo "✅ PASS: NODE_ENV=production set"
else
    echo "❌ FAIL: NODE_ENV=production not set"
    exit 1
fi

echo ""
echo "=== All tests passed! ==="
