const axios = require('axios');
const { getAddressInfo } = require('bitcoin-address-validation');

const BTC_API = 'https://blockstream.info/api';
const TIMEOUT_MS = 10000;

function validateBtcAddress(address) {
  const info = getAddressInfo(String(address).trim());

  if (!info || info.network !== 'mainnet') {
    throw new Error('Dirección Bitcoin mainnet inválida');
  }

  return info;
}

async function getBtcAddress(address) {
  const cleanAddress = String(address).trim();
  const info = validateBtcAddress(cleanAddress);

  const [addressResponse, transactionsResponse] = await Promise.all([
    axios.get(`${BTC_API}/address/${encodeURIComponent(cleanAddress)}`, {
      timeout: TIMEOUT_MS,
    }),
    axios.get(`${BTC_API}/address/${encodeURIComponent(cleanAddress)}/txs`, {
      timeout: TIMEOUT_MS,
    }),
  ]);

  const chain = addressResponse.data.chain_stats || {};
  const mempool = addressResponse.data.mempool_stats || {};

  const confirmedBalance =
    (chain.funded_txo_sum || 0) - (chain.spent_txo_sum || 0);

  const mempoolBalance =
    (mempool.funded_txo_sum || 0) - (mempool.spent_txo_sum || 0);

  return {
    address: cleanAddress,
    type: info.type,
    bech32: info.bech32,
    network: info.network,
    balanceSats: confirmedBalance,
    mempoolBalanceSats: mempoolBalance,
    balanceBTC: confirmedBalance / 100000000,
    transactions: transactionsResponse.data,
  };
}

module.exports = {
  validateBtcAddress,
  getBtcAddress,
};
