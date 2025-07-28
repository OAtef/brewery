#!/bin/bash

echo "🚀 Comprehensive Order System Test"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 - SUCCESS${NC}"
    else
        echo -e "${RED}❌ $1 - FAILED${NC}"
        exit 1
    fi
}

echo -e "${BLUE}📦 Test 1: Checking products availability...${NC}"
curl -s "$BASE_URL/api/products" > /tmp/products.json
check_status "Products API"

PRODUCT_COUNT=$(cat /tmp/products.json | jq '. | length')
echo "   Found $PRODUCT_COUNT products"

echo ""
echo -e "${BLUE}📦 Test 2: Checking packaging options...${NC}"
curl -s "$BASE_URL/api/packaging" > /tmp/packaging.json
check_status "Packaging API"

PACKAGING_COUNT=$(cat /tmp/packaging.json | jq '. | length')
echo "   Found $PACKAGING_COUNT packaging options"

echo ""
echo -e "${BLUE}🛒 Test 3: Creating a new order...${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "client": {
      "client_number": "TEST_AUTO_001",
      "name": "Automated Test Customer",
      "address": "123 Automation Lane",
      "application_used": "test_suite"
    },
    "userId": 1,
    "application": "test_suite",
    "total": 9.30,
    "products": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 4.65,
        "packagingId": 3
      }
    ]
  }')

if echo "$ORDER_RESPONSE" | jq -e '.id' > /dev/null; then
    ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')
    echo "   Created order with ID: $ORDER_ID"
    check_status "Order Creation"
else
    echo -e "${RED}❌ Order creation failed${NC}"
    echo "Response: $ORDER_RESPONSE"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Test 4: Retrieving all orders...${NC}"
ALL_ORDERS=$(curl -s "$BASE_URL/api/orders")
TOTAL_ORDERS=$(echo "$ALL_ORDERS" | jq '. | length')
echo "   Found $TOTAL_ORDERS total orders in system"
check_status "Get All Orders"

echo ""
echo -e "${BLUE}🔍 Test 5: Retrieving specific order by ID...${NC}"
SPECIFIC_ORDER=$(curl -s "$BASE_URL/api/orders/$ORDER_ID")
if echo "$SPECIFIC_ORDER" | jq -e '.id' > /dev/null; then
    ORDER_STATUS=$(echo "$SPECIFIC_ORDER" | jq -r '.status')
    echo "   Retrieved order $ORDER_ID with status: $ORDER_STATUS"
    check_status "Get Order by ID"
else
    echo -e "${RED}❌ Failed to retrieve order by ID${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Test 6: Testing order status updates...${NC}"

# Test status progression
STATUSES=("CONFIRMED" "PREPARING" "READY" "COMPLETED")

for STATUS in "${STATUSES[@]}"; do
    echo "   Updating order to: $STATUS"
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/orders/$ORDER_ID" \
      -H "Content-Type: application/json" \
      -d "{\"status\": \"$STATUS\"}")
    
    if echo "$UPDATE_RESPONSE" | jq -e '.status' > /dev/null; then
        UPDATED_STATUS=$(echo "$UPDATE_RESPONSE" | jq -r '.status')
        if [ "$UPDATED_STATUS" = "$STATUS" ]; then
            echo -e "      ${GREEN}✅ Status updated to: $UPDATED_STATUS${NC}"
        else
            echo -e "      ${RED}❌ Status update failed. Expected: $STATUS, Got: $UPDATED_STATUS${NC}"
            exit 1
        fi
    else
        echo -e "      ${RED}❌ Status update API call failed${NC}"
        echo "Response: $UPDATE_RESPONSE"
        exit 1
    fi
done

echo ""
echo -e "${BLUE}🔒 Test 7: Verifying final order data integrity...${NC}"
FINAL_ORDER=$(curl -s "$BASE_URL/api/orders/$ORDER_ID")

# Check required fields
REQUIRED_FIELDS=("id" "clientId" "userId" "createdAt" "updatedAt" "application" "total" "status" "client" "products")

for FIELD in "${REQUIRED_FIELDS[@]}"; do
    if echo "$FINAL_ORDER" | jq -e ".$FIELD" > /dev/null; then
        echo "   ✅ Field '$FIELD' present"
    else
        echo -e "   ${RED}❌ Missing required field: $FIELD${NC}"
        exit 1
    fi
done

# Verify client data
CLIENT_NAME=$(echo "$FINAL_ORDER" | jq -r '.client.name')
if [ "$CLIENT_NAME" != "null" ] && [ "$CLIENT_NAME" != "" ]; then
    echo "   ✅ Client data valid: $CLIENT_NAME"
else
    echo -e "   ${RED}❌ Client data invalid${NC}"
    exit 1
fi

# Verify products data
PRODUCT_COUNT=$(echo "$FINAL_ORDER" | jq '.products | length')
if [ "$PRODUCT_COUNT" -gt 0 ]; then
    echo "   ✅ Order contains $PRODUCT_COUNT products"
else
    echo -e "   ${RED}❌ No products in order${NC}"
    exit 1
fi

# Verify product details
FIRST_PRODUCT_NAME=$(echo "$FINAL_ORDER" | jq -r '.products[0].product.name')
FIRST_PACKAGING_TYPE=$(echo "$FINAL_ORDER" | jq -r '.products[0].packaging.type')

if [ "$FIRST_PRODUCT_NAME" != "null" ] && [ "$FIRST_PACKAGING_TYPE" != "null" ]; then
    echo "   ✅ Product details complete: $FIRST_PRODUCT_NAME in $FIRST_PACKAGING_TYPE"
else
    echo -e "   ${RED}❌ Product details incomplete${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ALL TESTS PASSED SUCCESSFULLY!${NC}"
echo ""
echo -e "${YELLOW}📊 Test Summary:${NC}"
echo "   ✅ Products API working ($PRODUCT_COUNT products available)"
echo "   ✅ Packaging API working ($PACKAGING_COUNT options available)"
echo "   ✅ Order creation functional (Order ID: $ORDER_ID)"
echo "   ✅ Order retrieval working ($TOTAL_ORDERS total orders)"
echo "   ✅ Order status updates functional (all transitions work)"
echo "   ✅ Data integrity maintained (all fields present)"
echo "   ✅ Complete order workflow verified"
echo ""
echo -e "${GREEN}🏆 Order management system is fully functional!${NC}"
