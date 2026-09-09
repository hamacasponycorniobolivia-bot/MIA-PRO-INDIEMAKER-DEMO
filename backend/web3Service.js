const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const assetAddress = process.env.CONTRACT_ASSET;
const usdcAddress = process.env.USDC_ADDRESS;

if (!rpcUrl) throw new Error('SEPOLIA_RPC_URL is required');
if (!privateKey) throw new Error('PRIVATE_KEY is required');
if (!assetAddress) throw new Error('CONTRACT_ASSET is required');
if (!usdcAddress) throw new Error('USDC_ADDRESS is required');

const artifactPath = path.join(__dirname, '..', '..', 'out', 'MIAAsset.sol', 'MIAAsset.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);
const assetContract = new ethers.Contract(assetAddress, artifact.abi, signer);
const usdcArtifactPath = path.join(__dirname, '..', '..', 'out', 'MIAUSDC.sol', 'MIAUSDC.json');
const usdcArtifact = JSON.parse(fs.readFileSync(usdcArtifactPath, 'utf8'));
const usdcContract = new ethers.Contract(usdcAddress, usdcArtifact.abi, signer);

async function mintNFT(recipientAddress, metadataUri) {
  if (!ethers.isAddress(recipientAddress)) {
    throw new Error('Dirección de destino inválida');
  }

  if (!metadataUri || typeof metadataUri !== 'string') {
    throw new Error('metadataUri es obligatorio');
  }

  const tx = await assetContract.mint(recipientAddress, metadataUri);
  const receipt = await tx.wait();

  const transferLog = receipt.logs
    .map((log) => {
      try {
        return assetContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed?.name === 'Transfer');

  const tokenId = transferLog?.args?.tokenId?.toString() ?? null;

  return {
    txHash: receipt.hash,
    tokenId
  };
}

async function transferNFT(fromAddress, toAddress, tokenId) {
  if (!ethers.isAddress(fromAddress)) {
    throw new Error('Dirección de origen inválida');
  }

  if (!ethers.isAddress(toAddress)) {
    throw new Error('Dirección de destino inválida');
  }

  if (!/^\d+$/.test(String(tokenId))) {
    throw new Error('tokenId inválido');
  }

  const tx = await assetContract['safeTransferFrom(address,address,uint256)'](
    fromAddress,
    toAddress,
    BigInt(tokenId)
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    tokenId: String(tokenId),
    fromAddress,
    toAddress
  };
}

async function transferMUSD(toAddress, amount) {
  if (!ethers.isAddress(toAddress)) {
    throw new Error('Dirección de destino inválida');
  }

  if (amount === undefined || amount === null || amount === '') {
    throw new Error('Monto obligatorio');
  }

  const decimals = await usdcContract.decimals();
  const value = ethers.parseUnits(String(amount), decimals);

  if (value <= 0n) {
    throw new Error('Monto inválido');
  }

  const tx = await usdcContract.transfer(toAddress, value);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    toAddress,
    amount: String(amount),
    asset: await usdcContract.symbol(),
    decimals: Number(decimals)
  };
}

module.exports = {
  provider,
  signer,
  assetContract,
  usdcContract,
  mintNFT,
  transferNFT,
  transferMUSD
};
