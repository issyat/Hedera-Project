console.clear();
require("dotenv").config();
const {
  AccountId,
  PrivateKey,
  Client,
  FileCreateTransaction,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  ContractInfoQuery,
  Hbar,
} = require("@hashgraph/sdk");

const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

async function deploySmartContract() {
  //Import the compiled contract from the HelloHedera.json file
  let helloHedera = require("./HelloHedera.json");
  const bytecode = helloHedera.data.bytecode.object;

  //Create a file on Hedera and store the hex-encoded bytecode
  const fileCreateTx = new FileCreateTransaction()
    //Set the bytecode of the contract
    .setContents(bytecode);

  //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
  const submitTx = await fileCreateTx.execute(client);

  //Get the receipt of the file create transaction
  const fileReceipt = await submitTx.getReceipt(client);

  //Get the file ID from the receipt
  const bytecodeFileId = fileReceipt.fileId;

  //Log the file ID
  console.log("The smart contract byte code file ID is " + bytecodeFileId);

  // Instantiate the contract instance
  const contractTx = await new ContractCreateTransaction()
    //Set the file ID of the Hedera file storing the bytecode
    .setBytecodeFileId(bytecodeFileId)
    //Set the gas to instantiate the contract
    .setGas(100000)
    //Provide the constructor parameters for the contract
    .setConstructorParameters(
      new ContractFunctionParameters().addString("Hello from Hedera!")
    );

  //Submit the transaction to the Hedera test network
  const contractResponse = await contractTx.execute(client);

  //Get the receipt of the file create transaction
  const contractReceipt = await contractResponse.getReceipt(client);

  //Get the smart contract ID
  const newContractId = contractReceipt.contractId;

  //Log the smart contract ID
  console.log("The smart contract ID is " + newContractId);
  return newContractId;
}

async function get_address(contractId) {
  const contractQuery = await new ContractCallQuery()
    .setGas(100000)
    .setContractId(contractId)
    .setFunction("get_address")
    .setQueryPayment(new Hbar(2));

  const get_address = await contractQuery.execute(client);

  const address = get_address.getString(0);

  console.log("The contract address: " + address);
}

async function setAddress(contractId, address) {
  const contractExecTx = await new ContractExecuteTransaction()
    
    .setContractId(contractId)  
    .setGas(100000)
    .setFunction(
      "set_address",
      new ContractFunctionParameters().addString(address)
    );

  const submitExecTx = await contractExecTx.execute(client);

  const receipt = await submitExecTx.getReceipt(client);
  console.log(
    "Updated address successfully",
    message,
    submitExecTx.transactionId.toString()
  );
}

async function getSmartContractInfo(contractId) {
  const query = new ContractInfoQuery().setContractId(contractId);

  const info = await query.execute(client);

  console.log(info);
}

async function main() {
  const contractId = await deploySmartContract();
  await getSmartContractInfo(contractId);
  await get_address(contractId);
  await setAddress(contractId, "Hello World!");
  await get_address(contractId);
}

main();