#!/bin/bash

echo "=== Debugging Frontend Environment Variables ==="
echo ""

# Check if containers are running
echo "1. Checking container status..."
docker-compose ps

echo ""
echo "2. Checking frontend container environment variables..."
docker-compose exec ticketflow-frontend env | grep VITE

echo ""
echo "3. Checking frontend logs for API base URL..."
docker-compose logs ticketflow-frontend | grep -i "baseurl\|api.*url" | tail -5

echo ""
echo "4. Testing API calls from inside the frontend container..."
docker-compose exec ticketflow-frontend sh -c "echo 'Testing API call to: \$VITE_API_BASE_URL/ticket'"

echo ""
echo "5. Checking browser network requests (manual check)..."
echo "Please open your browser's developer tools and check the Network tab"
echo "Look for requests to localhost:3001 vs /rest"

echo ""
echo "6. Current docker-compose.yml VITE_API_BASE_URL setting:"
grep "VITE_API_BASE_URL" docker-compose.yml

echo ""
echo "=== Debug complete ==="
echo ""
echo "If the environment variable is set correctly but the frontend still uses localhost:3001,"
echo "it means the frontend image needs to be rebuilt with the new environment variable."
echo ""
echo "Run: ./scripts/rebuild-frontend.sh to rebuild the frontend image" 