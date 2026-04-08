#!/bin/bash
# Test script to validate Design System configuration

set -e

echo "=== Design System Validation Tests ==="

# Test 1: Tailwind CSS styles file exists
echo "Test 1: Checking styles.css exists..."
if [ -f "frontend/src/styles.css" ]; then
    echo "✅ PASS: styles.css exists"
else
    echo "❌ FAIL: styles.css not found"
    exit 1
fi

# Test 2: Tailwind CSS import present
echo "Test 2: Checking Tailwind import..."
if grep -q '@import "tailwindcss"' frontend/src/styles.css; then
    echo "✅ PASS: Tailwind CSS imported"
else
    echo "❌ FAIL: Tailwind CSS not imported"
    exit 1
fi

# Test 3: Primary color tokens defined
echo "Test 3: Checking primary color tokens..."
if grep -q 'color-primary-500' frontend/src/styles.css && grep -q '#2d5a3d' frontend/src/styles.css; then
    echo "✅ PASS: Primary color tokens found"
else
    echo "❌ FAIL: Primary color tokens missing"
    exit 1
fi

# Test 4: Neutral color tokens defined
echo "Test 4: Checking neutral color tokens..."
if grep -q 'color-neutral-50' frontend/src/styles.css && grep -q 'color-neutral-900' frontend/src/styles.css; then
    echo "✅ PASS: Neutral color tokens found"
else
    echo "❌ FAIL: Neutral color tokens missing"
    exit 1
fi

# Test 5: Hexagon utility defined
echo "Test 5: Checking hexagon utility..."
if grep -q 'clip-path-hexagon' frontend/src/styles.css; then
    echo "✅ PASS: Hexagon clip-path defined"
else
    echo "❌ FAIL: Hexagon clip-path missing"
    exit 1
fi

# Test 6: Typography scale defined
echo "Test 6: Checking typography scale..."
if grep -q 'text-4xl' frontend/src/styles.css && grep -q 'text-5xl' frontend/src/styles.css; then
    echo "✅ PASS: Typography scale defined"
else
    echo "❌ FAIL: Typography scale missing"
    exit 1
fi

# Test 7: Spacing system defined
echo "Test 7: Checking spacing system..."
if grep -q 'spacing-4' frontend/src/styles.css && grep -q 'spacing-8' frontend/src/styles.css; then
    echo "✅ PASS: Spacing system defined"
else
    echo "❌ FAIL: Spacing system missing"
    exit 1
fi

# Test 8: Tailwind Vite plugin configured
echo "Test 8: Checking Tailwind Vite plugin..."
if [ -f "frontend/vite.config.js" ] && grep -q '@tailwindcss/vite' frontend/vite.config.js; then
    echo "✅ PASS: Tailwind Vite plugin configured"
else
    echo "❌ FAIL: Tailwind Vite plugin not configured"
    exit 1
fi

# Test 9: Tailwind dependencies in package.json
echo "Test 9: Checking Tailwind dependencies..."
if grep -q 'tailwindcss' frontend/package.json && grep -q '@tailwindcss/vite' frontend/package.json; then
    echo "✅ PASS: Tailwind dependencies found"
else
    echo "❌ FAIL: Tailwind dependencies missing"
    exit 1
fi

# Test 10: Design system documentation exists
echo "Test 10: Checking design system documentation..."
if [ -f "frontend/DESIGN_SYSTEM.md" ]; then
    echo "✅ PASS: DESIGN_SYSTEM.md found"
else
    echo "❌ FAIL: DESIGN_SYSTEM.md not found"
    exit 1
fi

echo ""
echo "=== All design system tests passed! ==="
