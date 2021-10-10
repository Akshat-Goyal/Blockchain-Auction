const EthCrypto = await require('eth-crypto');
const identity = await EthCrypto.createIdentity();

// Seller Side
let productString = "this is the product string.";
let encStr = await EthCrypto.encryptWithPublicKey(identity.publicKey, productString);
let encryptedString = await JSON.stringify(encStr);

// Buyer Side
let parsedString = await JSON.parse(encryptedString);
let decStr = await EthCrypto.decryptWithPrivateKey(identity.privateKey, parsedString);

console.log(decStr);
