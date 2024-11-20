const crypto = require('crypto');

const { ENCRYPTION } = require('../../config/config');
const ENCRYPTION_SECRET = '0123456789abcdef0123456789abcdcccccccccccccccccccccccccccccccccef'; // 32-byte hex
// // Hardcoded initialization vector (16 bytes in base64)
const ENCRYPTION_IV = 'Y2hhcm1lY3RpY2VsbGVycc';
class Encryption {
  constructor(encryptionKeys = {}) {
    this.secret = Buffer.from(encryptionKeys.secret || ENCRYPTION_SECRET, 'hex'); // Hex format
    // Ensure IV is treated as a Buffer
    this.iv = Buffer.from(encryptionKeys.iv || ENCRYPTION_IV, 'base64'); 
  }

  encryptWithAES(text) {
    // console.log(text);
    // console.log("bvdusgbvf");
    // console.log("Iv",this.iv);
    // console.log(this.secret);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.secret, this.iv);
    // console.log(cipher);
    // console.log("bvdusgbvf");
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  decryptWithAES(cipherText) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.secret, this.iv);
    const decrypted = decipher.update(cipherText, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
  }
}

const encryption = new Encryption();

module.exports = encryption;


