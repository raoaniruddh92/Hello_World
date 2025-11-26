import './App.css';
import Onboard from '@web3-onboard/core';
import metamaskSDK from '@web3-onboard/metamask';
import { useState, useEffect } from 'react';
import { deploy_contract } from './Blockchain/Deploy';
import { interact } from './Blockchain/Interact';
import logo from './logo.svg';

const INFURA_ID = 'e58130da3dee4d6c9f1ab1df59cbe8aa';

const chains = [
  {
    id: 11155111,
    token: 'ETH',
    label: 'Sepolia',
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_ID}`
  }
];

const metamaskSDKWallet = metamaskSDK({
  options: {
    extensionOnly: true,
    dappMetadata: { name: 'Demo Web3Onboard' }
  }
});

const onboard = Onboard({
  wallets: [metamaskSDKWallet],
  chains,
  appMetadata: {
    name: 'Web3-Onboard Demo',
    icon: logo,
    description: 'Web3-Onboard Demo Application',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' }
    ]
  },
  
  connect: { autoConnectLastWallet: true },
  accountCenter: {
      desktop: {
        enabled: true,
        position: 'topRight'
      },}
});

function App() {
  const [wallet, setWallet] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [returnValue, setReturnValue] = useState(null);

const connect = async () => {
    const wallets = await onboard.connectWallet();
    
    if (wallets[0]) {
      setWallet(wallets[0]);
      
      // *** ADD THIS PART ***
      try {
        // Sepolia chain ID is 11155111, which should be converted to hex string for setChain
        const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'; // 11155111 in hex

        // Request the wallet to switch to the Sepolia chain
        await onboard.setChain({ chainId: SEPOLIA_CHAIN_ID_HEX });
      } catch (error) {
        console.error("Failed to switch chain to Sepolia:", error);
      }
    }
  };
const handleDeploy = async () => {
    // 1. Show PENDING notification immediately
    const { update, dismiss } = onboard.state.actions.customNotification({
      type: 'pending',
      message: 'Contract deployment is in progress...',
      // Set autoDismiss to 0 (or a very high number) so the user sees it until updated
      autoDismiss: 0 
    });

    try {
      // This part runs the actual deployment
      const address = await deploy_contract();
      setContractAddress(address);
      
      // 2. Update to SUCCESS notification on completion
      update({
        eventCode: 'deploySuccess',
        message: `Contract successfully deployed! Address: ${address.substring(0, 6)}...`,
        type: 'success',
        // Dismiss after 5 seconds
        autoDismiss: 5000 
      });

    } catch (err) {
      console.error(err);
      
      // 3. Update to ERROR notification on failure
      update({
        eventCode: 'deployFailure',
        message: 'Failed to deploy contract. Check console for details.',
        type: 'error',
        // Dismiss after 8 seconds
        autoDismiss: 8000
      });
    }
  };

  const handleInteract = async () => {
    if (!contractAddress) return alert("Contract is not deployed yet.");

    try {
      const result = await interact(contractAddress);
      setReturnValue(result);
    } catch (err) {
      console.error(err);
    }
  };
useEffect(() => {
  // 1. Initial check
  const initialWallets = onboard.state.get().wallets;
  if (initialWallets.length > 0) {
    setWallet(initialWallets[0]);
  }

  // 2. Subscribe to the 'wallets' state slice
  const wallets$ = onboard.state.select('wallets');
  const subscription = wallets$.subscribe((newWallets) => { // Rename to subscription object
    if (newWallets.length > 0) {
      setWallet(newWallets[0]);
    } else {
      // Wallet has disconnected
      setWallet(null);
      setContractAddress(null);
      setReturnValue(null);
    }
  });

  // 3. Cleanup function to unsubscribe when the component unmounts
  return () => {
    // DEFENSIVE CHECK: Ensure the unsubscribe function exists before calling it.
    if (typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  };
}, []);
  return (
    <div className="app-container">
      
      <div className="header">
        <h1>Smart Contract Demo</h1>
        <p className="subtitle">Deploy & interact with a simple blockchain contract</p>
      </div>
{!wallet ? (
  <button className="primary-btn" onClick={connect}>
    Connect Wallet
  </button>
) : (
  <button className="primary-btn" disabled>
    Wallet Connected
  </button>
)}


      {/* Deploy Section */}
      <div className="card">
        <h2>Deploy Contract</h2>
<button
  className="primary-btn"
  disabled={!wallet}
  onClick={handleDeploy}
>
  {!wallet ? "Connect Wallet to Deploy" : "Deploy"}
</button>


        {contractAddress && (
          <p className="contract-address">
            Contract Address: <span>{contractAddress}</span>
          </p>
        )}
      </div>

      {/* Interact Section */}
      {contractAddress && (
        <div className="card">
          <h2>Interact with Contract</h2>
          <button className="secondary-btn" onClick={handleInteract}>
            Call Function
          </button>

          {returnValue && (
            <div className="task-box">
              <p>Contract says: <strong>{returnValue}</strong></p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default App;
