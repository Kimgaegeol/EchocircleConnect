const crypto = require("crypto");

// AES-256-CBC 암호화 함수
const encryptCI = (ciValue, key, iv) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key), // 키 변환
    Buffer.from(iv) // IV 변환
  );
  let encrypted = cipher.update(ciValue, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

// AES-256-CBC 복호화 함수
const decryptCI = (encryptedCI, key, iv) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key), // 키 변환
    Buffer.from(iv) // IV 변환
  );
  let decrypted = decipher.update(encryptedCI, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { encryptCI, decryptCI };
