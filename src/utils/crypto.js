import CryptoJS from "crypto-js";

const SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

// Encrypt
export const encrypt = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET).toString();
  } catch (e) {
    console.error("Encryption failed:", e);
    return null;
  }
};

// Decrypt
export const decrypt = (cipher) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
};
