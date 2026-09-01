#!/bin/bash

echo "============================================"
echo " MIA V1.0 E2E TEST"
echo "============================================"

# Obtener token de login
read -rsp "Contraseña de admin@mia.com: " TEST_PASSWORD; echo

PASS_COUNT=0
FAIL_COUNT=0

LOGIN_RESPONSE=$(

curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mia.com","password":"'"$TEST_PASSWORD"'"}'  )

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "TOKEN: [OCULTO — JWT obtenido correctamente]"

# 1. Test Register
echo "[1/6] Register"
REGISTER_EMAIL="nuevo_test_$(date +%s%N)@mia.com"
REGISTER_RESPONSE=$(curl -sS -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$REGISTER_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q '"user"'; then
  echo "PASS"
  ((PASS_COUNT++))
else
  echo "FAIL"
  echo "Response: $REGISTER_RESPONSE"
  ((FAIL_COUNT++))
fi

# 2. Test Login
echo "[2/6] Login"
LOGIN_RESPONSE=$(curl -sS -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mia.com","password":"'"$TEST_PASSWORD"'"}')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
  echo "PASS"
  ((PASS_COUNT++))
else
  echo "FAIL"
  echo "Response: $LOGIN_RESPONSE"
  ((FAIL_COUNT++))
fi

# 3. Test Create Tenant (Requiere token)
echo "[3/6] Tenant"
TENANT_RESPONSE=$(curl -sS -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Org E2E"}')

if echo "$TENANT_RESPONSE" | grep -q '"organization"'; then
  echo "PASS"
  ((PASS_COUNT++))
else
  echo "FAIL"
  echo "Response: $TENANT_RESPONSE"
  ((FAIL_COUNT++))
fi

# 4. Test Get Users (Requiere token)
echo "[4/6] Users"
USERS_RESPONSE=$(curl -sS http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN")

if echo "$USERS_RESPONSE" | grep -q '"id"'; then
  echo "PASS"
  ((PASS_COUNT++))
else
  echo "FAIL"
  echo "Response: $USERS_RESPONSE"
  ((FAIL_COUNT++))
fi

# 5. Test Wallet Balance
echo "[5/6] Wallet"
WALLET_RESPONSE=$(curl -sS http://localhost:3000/api/wallet/0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8)

if echo "$WALLET_RESPONSE" | grep -q '"usdc_balance"'; then
  echo "PASS"
  ((PASS_COUNT++))
else
  echo "FAIL"
  echo "Response: $WALLET_RESPONSE"
  ((FAIL_COUNT++))
fi

# 6. Test Webhooks (Requiere token)
echo "[6/6] Webhook"
WEBHOOK_RESPONSE=$(curl -sS -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url":"https://example.com/hook","event_type":"order.completed"}')

if echo "$WEBHOOK_RESPONSE" | grep -q '"webhook"'; then
  echo "PASS"
  ((PASS_COUNT++))
else
  echo "FAIL"
  echo "Response: $WEBHOOK_RESPONSE"
  ((FAIL_COUNT++))
fi

echo "============================================"
echo " RESULTS:"
echo "============================================"
echo "Total Tests: 6"
echo "PASS: $PASS_COUNT"
echo "FAIL: $FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "Status: PASS"
  exit 0
else
  echo "Status: FAIL"
  exit 1
fi
