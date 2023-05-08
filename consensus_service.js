console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  TopicDeleteTransaction,
  TopicInfoQuery,
  TopicUpdateTransaction,
} = require("@hashgraph/sdk");

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(operatorId, operatorKey);

async function main() {
    const privateKeyED = PrivateKey.generateED25519();
    const publicKeyED = privateKeyED.publicKey;
  //Create a new topic
  let txResponse = await new TopicCreateTransaction()
    .setAdminKey(operatorKey)
    .setSubmitKey(publicKeyED)
    .setTopicMemo("Hello World")
    .execute(client);

  //Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  const query = new TopicInfoQuery()
  .setTopicId(topicId);
  const info = await query.execute(client);

    //Print the account key to the console
    console.log("Topic Id : ", info.topicId,"\n","Topic memo : ",info.topicMemo);

    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send message to the topic
    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: "Hello, HCS!",
    }).execute(client);

 
}
main();