#!/bin/bash
# Test script to validate TanStack Start project initialization

set -e

echo "=== TanStack Start Project Initialization Tests ==="

# Test 1: package.json exists
echo "Test 1: Checking package.json exists..."
if [ -f "frontend/package.json" ]; then
    echo "✅ PASS: package.json exists"
else
    echo "❌ FAIL: package.json not found"
    exit 1
fi

# Test 2: package.json has correct type
echo "Test 2: Checking package.json type..."
if grep -q '"type": "module"' frontend/package.json; then
    echo "✅ PASS: package.json type is module"
else
    echo "❌ FAIL: package.json type is not module"
    exit 1
fi

# Test 3: Required dependencies exist
echo "Test 3: Checking required dependencies..."
if grep -q "@tanstack/react-start" frontend/package.json && \
   grep -q "@tanstack/react-router" frontend/package.json && \
   grep -q "react" frontend/package.json && \
   grep -q "react-dom" frontend/package.json; then
    echo "✅ PASS: Required dependencies found"
else
    echo "❌ FAIL: Missing required dependencies"
    exit 1
fi

# Test 4: Required devDependencies exist
echo "Test 4: Checking required devDependencies..."
if grep -q "vite" frontend/package.json && \
   grep -q "typescript" frontend/package.json && \
   grep -q "@vitejs/plugin-react" frontend/package.json && \
   grep -q "tailwindcss" frontend/package.json; then
    echo "✅ PASS: Required devDependencies found"
else
    echo "❌ FAIL: Missing required devDependencies"
    exit 1
fi

# Test 5: tsconfig.json exists with strict mode
echo "Test 5: Checking tsconfig.json strict mode..."
if [ -f "frontend/tsconfig.json" ] && grep -q '"strict": true' frontend/tsconfig.json; then
    echo "✅ PASS: tsconfig.json strict mode enabled"
else
    echo "❌ FAIL: tsconfig.json strict mode not enabled"
    exit 1
fi

# Test 6: vite.config.ts exists with TanStack Start plugin
echo "Test 6: Checking vite.config.ts..."
if [ -f "frontend/vite.config.ts" ] && grep -q "tanstackStart" frontend/vite.config.ts; then
    echo "✅ PASS: vite.config.ts with TanStack Start plugin found"
else
    echo "❌ FAIL: vite.config.ts not found or missing TanStack Start plugin"
    exit 1
fi

# Test 7: Required source files exist
echo "Test 7: Checking required source files..."
if [ -f "frontend/src/router.tsx" ] && \
   [ -f "frontend/src/routes/__root.tsx" ] && \
   [ -f "frontend/src/routes/index.tsx" ]; then
    echo "✅ PASS: Required source files found"
else
    echo "❌ FAIL: Missing required source files"
    exit 1
fi

# Test 8: package.json has correct scripts
echo "Test 8: Checking package.json scripts..."
if grep -q '"dev": "vite dev"' frontend/package.json && \
   grep -q '"build": "vite build"' frontend/package.json; then
    echo "✅ PASS: Required scripts found"
else
    echo "❌ FAIL: Missing required scripts"
    exit 1
fi

# Test 9: ESLint configuration exists
echo "Test 9: Checking ESLint configuration..."
if [ -f "frontend/eslint.config.js" ]; then
    echo "✅ PASS: ESLint configuration found"
else
    echo "❌ FAIL: ESLint configuration not found"
    exit 1
fi

# Test 10: Prettier configuration exists
echo "Test 10: Checking Prettier configuration..."
if [ -f "frontend/.prettierrc" ]; then
    echo "✅ PASS: Prettier configuration found"
else
    echo "❌ FAIL: Prettier configuration not found"
    exit 1
fi

echo ""
echo "=== All tests passed! ==="
