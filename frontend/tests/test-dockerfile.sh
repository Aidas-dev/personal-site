#!/bin/bash
# Test script to validate Frontend Dockerfile

set -e

echo "=== Frontend Dockerfile Validation Tests ==="

# Test 1: Dockerfile exists
echo "Test 1: Checking Dockerfile exists..."
if [ -f "frontend/Dockerfile" ]; then
    echo "✅ PASS: Dockerfile exists"
else
    echo "❌ FAIL: Dockerfile not found"
    exit 1
fi

# Test 2: Multi-stage build (should have at least 2 FROM statements)
echo "Test 2: Checking multi-stage build..."
FROM_COUNT=$(grep -c "^FROM" frontend/Dockerfile)
if [ "$FROM_COUNT" -ge 2 ]; then
    echo "✅ PASS: Multi-stage build detected ($FROM_COUNT stages)"
else
    echo "❌ FAIL: Expected at least 2 FROM statements, found $FROM_COUNT"
    exit 1
fi

# Test 3: Node.js 24 base image
echo "Test 3: Checking Node.js version..."
if grep -q "node:24" frontend/Dockerfile; then
    echo "✅ PASS: Node.js 24 base image found"
else
    echo "❌ FAIL: Node.js 24 base image not found"
    exit 1
fi

# Test 4: pnpm configured
echo "Test 4: Checking pnpm configuration..."
if grep -q "pnpm" frontend/Dockerfile; then
    echo "✅ PASS: pnpm configuration found"
else
    echo "❌ FAIL: pnpm not configured"
    exit 1
fi

# Test 5: Vite build command
echo "Test 5: Checking Vite build command..."
if grep -q "vite build\|pnpm run build" frontend/Dockerfile; then
    echo "✅ PASS: Vite build command found"
else
    echo "❌ FAIL: Vite build command not found"
    exit 1
fi

# Test 6: .output directory (Nitro build output)
echo "Test 6: Checking Nitro .output directory..."
if grep -q ".output" frontend/Dockerfile; then
    echo "✅ PASS: Nitro .output directory referenced"
else
    echo "❌ FAIL: Nitro .output directory not referenced"
    exit 1
fi

# Test 7: Health check configured
echo "Test 7: Checking health check..."
if grep -q "HEALTHCHECK" frontend/Dockerfile; then
    echo "✅ PASS: Health check configured"
else
    echo "❌ FAIL: Health check not configured"
    exit 1
fi

# Test 8: Production environment set
echo "Test 8: Checking NODE_ENV..."
if grep -q "NODE_ENV=production" frontend/Dockerfile; then
    echo "✅ PASS: NODE_ENV=production set"
else
    echo "❌ FAIL: NODE_ENV=production not set"
    exit 1
fi

# Test 9: Production dependencies only
echo "Test 9: Checking production-only dependencies..."
if grep -q "\-\-prod" frontend/Dockerfile; then
    echo "✅ PASS: Production-only dependencies configured"
else
    echo "❌ FAIL: Production-only dependencies not configured"
    exit 1
fi

# Test 10: Server entry point
echo "Test 10: Checking server entry point..."
if grep -q ".output/server/index.mjs" frontend/Dockerfile; then
    echo "✅ PASS: Nitro server entry point configured"
else
    echo "❌ FAIL: Nitro server entry point not configured"
    exit 1
fi

echo ""
echo "=== All tests passed! ==="
