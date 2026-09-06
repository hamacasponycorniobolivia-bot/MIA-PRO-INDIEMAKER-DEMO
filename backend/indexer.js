const { ethers } = require('ethers');
const { Pool } = require('pg');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const assetAddress = process.env.CONTRACT_ASSET;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ABI mínimo para escuchar los eventos del ERC-721
const assetAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

async function start() {
  console.log("🚀 Iniciando Indexer de MIA en Sepolia...");
  const assetContract = new ethers.Contract(assetAddress, assetAbi, provider);

  assetContract.on("Transfer", async (from, to, tokenId, event) => {
    console.log(`🎨 Escuchando Transferencia: NFT ${tokenId} de ${from} a ${to}`);

    // Guardar en base de datos
    try {
      // 1. Registrar la transacción
      await pool.query(
        `INSERT INTO transactions (tx_hash, event_type, from_address, to_address, token_id, block_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [event.log.transactionHash, 'Transfer', from, to, tokenId.toString(), event.log.blockNumber]
      );

      // 2. Obtener el tenant del nuevo dueño
    const walletResult = await pool.query(
      `SELECT tenant_id
       FROM wallets
       WHERE user_address = $1`,
      [to]
    );

    const tenantId = walletResult.rows[0]?.tenant_id ?? null;

    // 3. Actualizar el dueño y tenant del asset
    await pool.query(
      `INSERT INTO assets (token_id, owner_address, tenant_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (token_id)
       DO UPDATE SET
         owner_address = EXCLUDED.owner_address,
         tenant_id = EXCLUDED.tenant_id`,
      [tokenId.toString(), to, tenantId]
    );

    console.log(`✅ Transacción registrada y dueño actualizado.`);
    } catch (dbError) {
      console.error("❌ Error guardando en DB:", dbError.message);
    }
  });

  console.log(`👂 Escuchando contrato: ${assetAddress}`);
}

start().catch(console.error);
