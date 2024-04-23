 var web3;
const providerUrl = 'https://mainnet.infura.io/v3/b8e15e2883544b038a23bf6afeecb997';



var abi =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "blockHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
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
			}
		],
		"name": "LocationSetWithTime",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "blockHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_encryptedLocation",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_encryptedLongitude",
				"type": "string"
			}
		],
		"name": "setLocationData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "blockHash",
				"type": "bytes32"
			}
		],
		"name": "getLocationData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
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
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "locationData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "encryptedLocation",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "encryptedLongitude",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


async function Connect() {
  try {
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
    } else {
      web3 = new Web3(providerUrl);
    }
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];
    
    console.log('Web3 initialized successfully');
    const address = "0xa6D4d1E2543aB7bD4D7c3023D144f540d65C0CCf";
    contract = new web3.eth.Contract(abi, address);
    
    // Now you can use the contract object for Ethereum operations
  } catch (error) {
    console.error('Error initializing web3:', error);
    // Handle error
  }
}

Connect(); // Call the Connect function to initialize web3 and create the contract instance



document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('getLocationBtn').addEventListener('click', async () => {
    try {
      // Function to generate a block hash based on timestamp, latitude, and longitude
      function generateBlockHash(latitude, longitude, timestamp) {
        const dataToHash = `${timestamp}-${latitude}-${longitude}`;
        return web3.utils.keccak256(dataToHash);
      }

      // Function to get user's current location
      function getCurrentLocation() {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const latitude = position.coords.latitude.toString();
              const longitude = position.coords.longitude.toString();
              resolve({ latitude, longitude });
            },
            (error) => {
              reject(error);
            }
          );
        });
      }

      // Get user's current location
      const location = await getCurrentLocation();
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

      // Generate block hash based on location data and timestamp
      const blockHash = generateBlockHash(location.latitude, location.longitude, timestamp);

      // Send block hash to server
      const response = await fetch('/storeBlockHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockHash,
        }),
      });

      const data = await response.json();
      console.log(data); // Log response from server (optional)

      console.log('Block hash:', blockHash);

      const accounts = await web3.eth.getAccounts();
      await contract.methods.setLocationData(blockHash, timestamp, location.latitude, location.longitude)
        .send({ from: accounts[0], gas: 3000000 });

      console.log('Location data submitted successfully:', location);
      console.log('Block hash:', blockHash);
    } catch (error) {
      console.error('Error submitting location data:', error);
    }
  });
});

async function getLocationData(blockHash) {
	try {
	  // Call the getLocationData function of the contract to retrieve location data
	  const locationData = await contract.methods.getLocationData(blockHash).call();
	  
	  // locationData will be an array containing timestamp, latitude, and longitude
	  const timestamp = parseInt(locationData[0]); // Assuming timestamp is returned as a string
	  const latitude = locationData[1];
	  const longitude = locationData[2];
  
	  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
	  const formattedDate = date.toLocaleString();
  
	  console.log('Retrieved location data:');
	  console.log('Latitude:', latitude);
	  console.log('Longitude:', longitude);
	  console.log('Time:', formattedDate);
  
	  return { latitude, longitude, formattedDate }; // Return location data as an object
	} catch (error) {
	  console.error('Error retrieving location data:', error);
	  throw error; // Propagate the error if needed
	}
  }
  
  document.getElementById('retrieveLocationBtn').addEventListener('click', async () => {
	const blockHashInput = document.getElementById('blockHashInput');
	const blockHash = blockHashInput.value.trim(); // Get the block hash from the input field
  
	if (!blockHash) {
	  alert('Please enter a valid block hash.');
	  return;
	}
	try {
	  const { latitude, longitude, formattedDate } = await getLocationData(blockHash);
	  console.log('Location:', { latitude, longitude, formattedDate });
  
	  // Update the locationInfo section with the retrieved location data
	  const locationInfo = document.getElementById('locationInfo');
	  locationInfo.innerHTML = `
		<img src="https://tse1.mm.bing.net/th?id=OIP.GjyasIl5vrmGOVNPgpqRZwHaHa&pid=Api&P=0&h=180" alt="Location Icon" class="icon">
		<p class="info-text">Location Information</p>
		<p>Latitude: ${latitude}</p>
		<p>Longitude: ${longitude}</p>
		<p>Time: ${formattedDate}</p>
	  `;
	} catch (error) {
	  console.error('Error:', error);
	  alert('Error retrieving location data. Check the console for details.');
	}
  });
  




document.getElementById('myLocationBtn').addEventListener('click',async()=>{
	try {
		const response = await fetch('http://localhost:3000/hashes');
		if (!response.ok) {
		  throw new Error('Failed to fetch hashes');
		}
		const hashes = await response.json();
		// Store the hashes in sessionStorage to access them on the new page
		sessionStorage.setItem('hashes', JSON.stringify(hashes));
		// Redirect to a new HTML page
		window.location.href = '/display-hashes.html';
	  } catch (error) {
		console.error('Error fetching hashes:', error);
		alert(error)
	  }
})


const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {
  window.location.href = '/login';
});