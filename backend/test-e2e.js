const axios = require('axios');
const readline = require('readline');

function askPassword() {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Contraseña de admin@mia.com: ', answer => {
      rl.close();
      resolve(answer);
    });
  });
}

const API = 'http://localhost:3000';

async function test() {
  const TEST_PASSWORD = await askPassword();
  console.log('============================================');
  console.log(' MIA V1.0 E2E TEST');
  console.log('============================================');

  // 1. Login
  const login = await axios.post(`${API}/api/auth/login`, { email: 'admin@mia.com', password: TEST_PASSWORD });
  const token = login.data.token;
  console.log(`[✓] Login: PASS (Token: ${token.substring(0, 20)}...)`);

  // 2. Register
  try {
    await axios.post(`${API}/api/auth/register`, { email: 'nuevo_test_1787671688@mia.com', password: TEST_PASSWORD });
    console.log('[✓] Register: PASS');
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('[✓] Register: PASS (User already exists)');
    } else {
      console.log('[✗] Register: FAIL');
    }
  }

  // 3. Create Organization
  try {
    await axios.post(`${API}/api/organizations`, { name: 'Test Org E2E' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('[✓] Tenant: PASS');
  } catch (error) {
    console.log(`[✗] Tenant: FAIL (${error.response ? error.response.data.error : error.message})`);
  }

  // 4. Get Users
  try {
    const users = await axios.get(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
    if (users.data.length > 0) console.log('[✓] Users: PASS');
    else console.log('[✗] Users: FAIL');
  } catch (error) {
    console.log(`[✗] Users: FAIL (${error.response ? error.response.data.error : error.message})`);
  }

  // 5. Wallet
  try {
    const wallet = await axios.get(`${API}/api/wallet/0xc3bB09D6453970fc8e093e8E7860c79dFae0e6B8`);
    if (wallet.data) console.log('[✓] Wallet: PASS');
    else console.log('[✗] Wallet: FAIL');
  } catch (error) {
    console.log(`[✗] Wallet: FAIL (${error.message})`);
  }

  // 6. Webhook
  try {
    await axios.post(`${API}/api/webhooks`, { url: 'https://example.com/mia-e2e-test', event_type: 'order.completed' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('[✓] Webhook: PASS');
  } catch (error) {
    console.log(`[✗] Webhook: FAIL (${error.response ? error.response.data.error : error.message})`);
  }

  console.log('============================================');
  console.log(' RESULTS:');
  console.log('============================================');
  console.log('Status: COMPLETE');
}

test();
