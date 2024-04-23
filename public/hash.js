// Connect to Ethereum node and contract
var web3;
var contractAddress = '0xc09B31F99a1EB597FDb4de5135955ff8099BC099'; // Replace with your contract address
var contractAbi =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "blockHash",
				"type": "bytes32"
			}
		],
		"name": "BlockHashRetrieved",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getBlockHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLocationWithTime",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "encryptedLocation",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "encryptedLongitude",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "LocationRetrieved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "encryptedLocation",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "encryptedLongitude",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "LocationSetWithTime",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_encryptedLocation",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_encryptedLongitude",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_timestamp",
				"type": "uint256"
			}
		],
		"name": "setLocationWithTime",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "encryptedLocation",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "encryptedLongitude",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "timestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function initWeb3() {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
  } else if (typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }
}

async function getBlockHash() {
  try {
    // Initialize Web3
    await initWeb3();

    // Get the contract instance
    var contract = new web3.eth.Contract(contractAbi, contractAddress);

    // Specify the sender's address in the transaction options
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0]; // Use the first account as the sender

    // Call the getBlockHash function of the smart contract with the sender's address
    const result = await contract.methods.getBlockHash().send({ from: fromAddress });

    // Display the block hash on the front end
    const blockHash = result.events.BlockHashRetrieved.returnValues.blockHash;
    console.log(`Block Hash: ${blockHash}`);
	alert(`${blockHash}`);
  } catch (error) {
    console.error('Error retrieving block hash:', error);
    alert('Error retrieving block hash: ' + error.message);
  }
}

document.getElementById('getBlockHashBtn').addEventListener('click', getBlockHash);
