const crypto = require('crypto');

const KEY_HEX = process.env.TOTP_ENCRYPTION_KEY;

if (!KEY_HEX || !/^[0-9a-fA-F]{64}$/.test(KEY_HEX)) {
  throw new Error('TOTP_ENCRYPTION_KEY must be a 64-character hex string');
}

const KEY = Buffer.from(KEY_HEX, 'hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encryptSecret(secret) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(secret), 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex')
  ].join(':');
}

function decryptSecret(payload) {
  const parts = String(payload || '').split(':');

  if (parts.length !== 3) {
    throw new Error('Formato de secreto TOTP cifrado inválido');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  if (
    iv.length !== IV_LENGTH ||
    authTag.length !== AUTH_TAG_LENGTH ||
    encrypted.length === 0
  ) {
    throw new Error('Secreto TOTP cifrado inválido');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');
}

module.exports = {
  encryptSecret,
  decryptSecret
};
