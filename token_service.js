console.clear();
require("dotenv").config();
const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenInfoQuery,
  AccountBalanceQuery,
  PrivateKey,
  TokenMintTransaction,
  TokenBurnTransaction,
  AccountCreateTransaction,
  TokenUpdateTransaction,
} = require("@hashgraph/sdk");

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

  //Create new keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account with 1,000 tinybar starting balance
  const firstAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.from(1000))
    .execute(client);


      //Create new keys
  const secondAccountPrivateKey = PrivateKey.generateED25519();
  const secondAccountPublicKey = secondAccountPrivateKey.publicKey;

  //Create a new account with 1,000 tinybar starting balance
  const secondAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.from(1000))
    .execute(client);

    // Get the new account ID
    const getReceipt = await firstAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;


     // Get the new account ID
     const getReceipt2 = await secondAccount.getReceipt(client);
     const newAccountId2 = getReceipt.accountId;
 

async function createNFT() {
  console.log("CreateNFT---------------------");
  let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("MyNFT")
    .setTokenSymbol("MNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setInitialSupply(0)
    .setTreasuryAccountId(myAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setAdminKey(myAccountId)
    .setSupplyKey(newAccountPublicKey)
    .setFeeScheduleKey(secondAccountPublicKey)
    .setTokenMemo("Token Memo")
    //.setKycKey(myPrivateKey)
    .freezeWith(client);

  let tokenCreateSign = await tokenCreateTx.sign(myPrivateKey);
  let tokenCreateSubmit = await tokenCreateSign.execute(client);
  let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
  let tokenId = tokenCreateRx.tokenId;
  console.log(`- Created token with ID: ${tokenId}`);
  console.log("-----------------------------------");
  return tokenId;
}

async function queryUpdateToken()
{
    //Update the name of the token
const transaction = new TokenUpdateTransaction()
.setTokenId(createNFT())
.setTokenMemo("new memo");

//Build the unsigned transaction, sign with the token admin private key of the token, submit the transaction to a Hedera network
const transactionId = await transaction.build(client).sign(adminKey).execute(client);

//Request the receipt of the transaction
const receipt = await transactionId.getReceipt(client);

//Get the transaction consensus status
const transactionStatus = receipt.status;

console.log("The transaction consensus status is " +transactionStatus);
//Version: 1.4.2
}

async function queryTokenInfo(tokenId) {
  console.log("QueryTokenInfo---------------------");
  const query = new TokenInfoQuery().setTokenId(tokenId);
  const tokenInfo = await query.execute(client);
  console.log(JSON.stringify(tokenInfo, null, 4));
  console.log("-----------------------------------");
}

async function queryAccountBalance(accountId) {
  console.log("QueryAccountBalance----------------");
  const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
  const accountBalance = await balanceQuery.execute(client);
  console.log(JSON.stringify(accountBalance, null, 4));
  console.log("-----------------------------------");
}

async function mintNFT(tokenId) {
  console.log("MintNFT--------------------------");

  // Mint new NFT
  let mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([
      Buffer.from("ipfs://QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa"),
      Buffer.from("secondToken"),
    ])
    .execute(client);
  let mintRx = await mintTx.getReceipt(client);
  //Log the serial number
  console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials} \n`);

  console.log("-----------------------------------");
}

async function transfetNFT(accountB)
{

var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);


var balanceCheckTx = await new AccountBalanceQuery().setAccountId(accountB).execute(client);
console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

const tokenTransferTx = await new TransferTransaction()
	.addNftTransfer(tokenId, 1, treasuryId, accountB)
	.freezeWith(client)
	.sign(treasuryKey);

const tokenTransferSubmit = await tokenTransferTx.execute(client);
const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

console.log(`\n- NFT transfer from Treasury to Alice: ${tokenTransferRx.status} \n`);
var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);

var balanceCheckTx = await new AccountBalanceQuery().setAccountId(accountB).execute(client);
console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} NFTs of ID ${tokenId}`);
}

async function main() {
  const tokenId = await createNFT();
  await queryTokenInfo(tokenId);
  await queryUpdateToken();
  await queryAccountBalance(myAccountId);
  await mintNFT(tokenId);
  await queryAccountBalance(myAccountId);
  await transfetNFT(newAccountId)
}
main();