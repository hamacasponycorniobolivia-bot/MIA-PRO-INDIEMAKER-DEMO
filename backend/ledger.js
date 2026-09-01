const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  max: 10,
});


async function resolveLedgerAccountId(client, accountCode) {
  const accountMap = {
    ASSET_WALLET: 4,
    USER_FUNDS: 5,
  };

  const accountId = accountMap[accountCode];

  if (!accountId) {
    throw new Error(`Unknown ledger account code: ${accountCode}`);
  }

  const result = await client.query(
    `SELECT id FROM ledger_accounts WHERE id = $1 LIMIT 1`,
    [accountId]
  );

  if (result.rowCount === 0) {
    throw new Error(`Ledger account ${accountCode} is not available`);
  }

  return result.rows[0].id;
}

async function postLedgerTransaction({
  transactionId = null,
  tenantId = null,
  currency = 'USDC',
  referenceType = 'payment',
  referenceId = null,
  reference = null,
  description = null,
  metadata = {},
  entries,
  client = null,
}) {
  if (!Array.isArray(entries) || entries.length < 2) {
    throw new Error('At least two ledger entries are required');
  }

  const db = client || pool;

  const resolvedReference =
    reference ||
    referenceId ||
    transactionId;

  if (!resolvedReference) {
    throw new Error('Ledger reference is required');
  }

  const resolvedMetadata = {
    ...metadata,
    tenantId,
    currency,
    referenceType,
    transactionId,
  };

  const resolvedEntries = [];

  for (const entry of entries) {
    const debit = entry.debit == null ? 0 : Number(entry.debit);
    const credit = entry.credit == null ? 0 : Number(entry.credit);

    if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
      throw new Error('Each ledger entry must contain debit OR credit');
    }

    if (debit < 0 || credit < 0) {
      throw new Error('Ledger amounts cannot be negative');
    }

    let accountId = entry.accountId;

    if (!accountId && entry.accountCode) {
      accountId = await resolveLedgerAccountId(db, entry.accountCode);
    }

    if (!accountId) {
      throw new Error('Ledger entry requires accountId');
    }

    resolvedEntries.push({
      accountId: Number(accountId),
      debit,
      credit,
    });
  }

  const debitTotal = resolvedEntries.reduce(
    (sum, e) => sum + e.debit,
    0
  );

  const creditTotal = resolvedEntries.reduce(
    (sum, e) => sum + e.credit,
    0
  );

  if (Math.abs(debitTotal - creditTotal) > 0.000000000001) {
    throw new Error(
      `Unbalanced ledger transaction: debit=${debitTotal} credit=${creditTotal}`
    );
  }

  const result = await db.query(
    `SELECT post_ledger_transaction($1, $2, $3::jsonb, $4::jsonb) AS transaction_id`,
    [
      resolvedReference,
      description,
      JSON.stringify(resolvedMetadata),
      JSON.stringify(resolvedEntries),
    ]
  );

  return {
    transactionId: result.rows[0].transaction_id,
    reference: resolvedReference,
  };
}

async function getAccount({ tenantId, accountCode, client = null }) {
  const db = client || pool;

  const result = await db.query(
    `SELECT *
       FROM ledger_accounts
      WHERE tenant_id = $1
        AND account_code = $2
        AND active = TRUE
      LIMIT 1`,
    [tenantId, accountCode]
  );

  return result.rows[0] || null;
}

async function getTransaction(transactionId, client = null) {
  const db = client || pool;

  const result = await db.query(
    `SELECT
       le.*,
       la.account_code,
       la.account_name,
       la.account_type
     FROM ledger_entries le
     JOIN ledger_accounts la
       ON la.id = le.account_id
     WHERE le.transaction_id = $1
     ORDER BY le.id`,
    [transactionId]
  );

  return result.rows;
}

module.exports = {
  pool,
  postLedgerTransaction,
  getAccount,
  getTransaction,
};
