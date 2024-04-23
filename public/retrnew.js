var Url = 'wss://mainnet.infura.io/ws/v3/b8e15e2883544b038a23bf6afeecb997'; // Replace with your Web3 provider WebSocket URL

var web3;

async function initWeb3() {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
  } else if (typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.WebsocketProvider("http://127.0.0.1:8545")); // Use WebSocket provider
  }
}

// Define the address and ABI of your smart contract
var contractAddress = '0x2128CEf28A64a07F7512d271ce702Af664Ddbc2b'; // Replace with your contract address
var contractAbi =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "encryptedLocation",
				"type": "string"
			}
		],
		"name": "LocationSetWithTime",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_encryptedLocationData",
				"type": "string"
			}
		],
		"name": "setLocationWithTime",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "encryptedLocationData",
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
		"name": "getLocationWithTime",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Function to listen for the DataStored event and retrieve data
async function listenForDataStored() {
  try {
    // Initialize Web3
    await initWeb3();

    // Get the contract instance
    var contract = new web3.eth.Contract(contractAbi, contractAddress);

  contract.events.DataStored()
      .on('data', async (event) => {
        const eventData = event.returnValues.data;
        console.log('Data stored in the block:', eventData);

        // Display data on the front end or perform other actions
        displayData(eventData);
      })
      .on('error', (error) => {
        console.error('Error listening to DataStored event:', error);
        alert('Error listening to DataStored event: ' + error.message);
      });
  } catch (error) {
    console.error('Error initializing Web3 and contract:', error);
    alert('Error initializing Web3 and contract: ' + error.message);
  }
}

// Function to display data on the front end
function displayData(data) {
  const dataDisplayDiv = document.getElementById('dataDisplay');
  alert(`Data stored in the block: ${data}`);
}


// Call the function to start listening for the DataStored event
listenForDataStored();
