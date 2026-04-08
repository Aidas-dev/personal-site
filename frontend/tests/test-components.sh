#!/bin/bash
# Test script to validate Core Component Library

set -e

echo "=== Core Component Library Validation Tests ==="

# Test 1: Components directory exists
echo "Test 1: Checking components directory..."
if [ -d "frontend/src/components" ]; then
    echo "✅ PASS: Components directory exists"
else
    echo "❌ FAIL: Components directory not found"
    exit 1
fi

# Test 2: Button component exists with variants
echo "Test 2: Checking Button component..."
if [ -f "frontend/src/components/Button.tsx" ] && \
   grep -q "primary" frontend/src/components/Button.tsx && \
   grep -q "secondary" frontend/src/components/Button.tsx && \
   grep -q "outline" frontend/src/components/Button.tsx && \
   grep -q "isLoading" frontend/src/components/Button.tsx; then
    echo "✅ PASS: Button component with variants found"
else
    echo "❌ FAIL: Button component missing variants"
    exit 1
fi

# Test 3: Card component exists
echo "Test 3: Checking Card component..."
if [ -f "frontend/src/components/Card.tsx" ] && \
   grep -q "product" frontend/src/components/Card.tsx && \
   grep -q "hexagon" frontend/src/components/Card.tsx; then
    echo "✅ PASS: Card component found"
else
    echo "❌ FAIL: Card component missing"
    exit 1
fi

# Test 4: Input component exists
echo "Test 4: Checking Input component..."
if [ -f "frontend/src/components/Input.tsx" ] && \
   grep -q "label" frontend/src/components/Input.tsx && \
   grep -q "error" frontend/src/components/Input.tsx; then
    echo "✅ PASS: Input component found"
else
    echo "❌ FAIL: Input component missing"
    exit 1
fi

# Test 5: Alert component exists
echo "Test 5: Checking Alert component..."
if [ -f "frontend/src/components/Alert.tsx" ] && \
   grep -q "success" frontend/src/components/Alert.tsx && \
   grep -q "error" frontend/src/components/Alert.tsx && \
   grep -q "warning" frontend/src/components/Alert.tsx && \
   grep -q "info" frontend/src/components/Alert.tsx; then
    echo "✅ PASS: Alert component found"
else
    echo "❌ FAIL: Alert component missing"
    exit 1
fi

# Test 6: Container component exists
echo "Test 6: Checking Container component..."
if [ -f "frontend/src/components/Container.tsx" ]; then
    echo "✅ PASS: Container component found"
else
    echo "❌ FAIL: Container component missing"
    exit 1
fi

# Test 7: Spinner component exists
echo "Test 7: Checking Spinner component..."
if [ -f "frontend/src/components/Spinner.tsx" ]; then
    echo "✅ PASS: Spinner component found"
else
    echo "❌ FAIL: Spinner component missing"
    exit 1
fi

# Test 8: Component index exists
echo "Test 8: Checking component index..."
if [ -f "frontend/src/components/index.ts" ] && \
   grep -q "Button" frontend/src/components/index.ts && \
   grep -q "Card" frontend/src/components/index.ts; then
    echo "✅ PASS: Component index found"
else
    echo "❌ FAIL: Component index missing"
    exit 1
fi

# Test 9: Components use design tokens
echo "Test 9: Checking design token usage..."
if grep -rq "primary-500\|neutral-900\|bg-success\|text-error" frontend/src/components/; then
    echo "✅ PASS: Components use design tokens"
else
    echo "❌ FAIL: Components don't use design tokens"
    exit 1
fi

# Test 10: Home page imports components
echo "Test 10: Checking home page imports..."
if grep -q "@/components" frontend/src/routes/index.tsx && \
   grep -q "Button" frontend/src/routes/index.tsx && \
   grep -q "Card" frontend/src/routes/index.tsx; then
    echo "✅ PASS: Home page imports components"
else
    echo "❌ FAIL: Home page doesn't import components"
    exit 1
fi

echo ""
echo "=== All component library tests passed! ==="
