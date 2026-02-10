const crypto = require("crypto");

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  console.log("Salt:", salt);
  console.log("Stored hash length:", hash.length);
  console.log("Computed hash length:", verifyHash.length);
  console.log("Match:", hash === verifyHash);
  console.log("Stored  :", hash.substring(0, 60));
  console.log("Computed:", verifyHash.substring(0, 60));
  return hash === verifyHash;
}

const pwHash = "37029cb64a740a01f67c13103a3c056b:6ed625fa61a0c55f33af0c381fbd6ee3ad18794e19937e431d1b746ee24c276840f55d066f9ce127f9d7c37edfcca98b242b0d538020660158ba618117c980d2";
const pinHash = "d9d2a3ba40548f03512d9e070620d705:364fb9d9004380508e436211f1357a6aabe3fe904c8bedadadf214103de6edd430088d2ebb4996d8111b6971a40ec5efbc9f6b578f26b334611cb18fb23fcad8";

console.log("=== Testing password '123456' ===");
verifyPassword("123456", pwHash);

console.log("\n=== Testing PIN '1234' ===");
verifyPassword("1234", pinHash);
