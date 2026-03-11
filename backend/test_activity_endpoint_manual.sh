#!/bin/bash
# Manual test script for Activity endpoints
# Run this after the backend is running

BASE_URL="http://localhost:8000/api/v1"

echo "=== Activity Endpoint Manual Tests ==="
echo ""

# Test 1: Health check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test 2: Try to access without authentication (should fail with 401)
echo "2. GET /activity/recent without auth (should fail)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/activity/recent"
echo ""

# Test 3: Login to get token
echo "3. Login to get JWT token"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Please ensure you have a user with email 'user@example.com' and password 'password'"
  echo "Or create one with: POST /api/v1/auth/register"
  exit 1
fi

echo "✓ Got token: ${TOKEN:0:20}..."
echo ""

# Test 4: GET recent activities with auth
echo "4. GET /activity/recent with auth (default limit=10)"
curl -s "$BASE_URL/activity/recent" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 5: GET with custom limit
echo "5. GET /activity/recent with limit=5"
curl -s "$BASE_URL/activity/recent?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 6: GET with invalid limit (should fail with 422)
echo "6. GET /activity/recent with invalid limit=0 (should fail)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/activity/recent?limit=0" \
  -H "Authorization: Bearer $TOKEN"
echo ""

# Test 7: GET with invalid limit > 100 (should fail with 422)
echo "7. GET /activity/recent with invalid limit=101 (should fail)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/activity/recent?limit=101" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "=== Manual Tests Complete ==="

