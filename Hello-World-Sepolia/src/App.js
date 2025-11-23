import logo from './logo.svg';
import './App.css';
import Onboard from '@web3-onboard/core'
import metamaskSDK from '@web3-onboard/metamask'
import { useState, useEffect } from 'react'; // Import React hooks

// --- Configuration ---
const INFURA_ID = 'e58130da3dee4d6c9f1ab1df59cbe8aa'

const chains = [
  {
    id: 1,
    token: 'ETH',
    label: 'Ethereum Mainnet',
    // FIX: Use template literal for INFURA_ID
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}` 
  }
]

const metamaskSDKWallet = metamaskSDK({options: {
  extensionOnly: false,
  dappMetadata: {
    name: 'Demo Web3Onboard'
  }
}})

// --- Web3-Onboard Initialization ---
// The onboard instance should ideally be created outside the component or 
// memoized, but for simplicity, we'll initialize it here and make it accessible.
const onboard = Onboard({
  wallets: [
    metamaskSDKWallet,
  ],
  // 1. PASS THE CHAINS
  chains: chains, 
  appMetadata: {
    name: 'Web3-Onboard Demo',
    icon: logo, // Use the imported logo
    description: 'Web3-Onboard Demo Application',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' }
    ]
  },
  connect: {

    autoConnectLastWallet: true 
  }
})


function App() {
  const [wallet, setWallet] = useState(null); 
  const connect = async () => {
    const wallets = await onboard.connectWallet();
    
    if (wallets[0]) {
      setWallet(wallets[0]);
    }
  };

  const disconnect = async () => {
    if (wallet) {
      await onboard.disconnectWallet({ label: wallet.label });
      setWallet(null);
    }
  };
  
  useEffect(() => {
    const subscription = onboard.state.select('wallets').subscribe((wallets) => {
      if (wallets.length > 0) {
        setWallet(wallets[0]);
      } else {
        setWallet(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <h1>Web3-Onboard & MetaMask Demo</h1>
        {wallet ? (
          <div>
            <p>Wallet Connected</p>
            <p>Address: **{wallet.accounts[0].address.substring(0, 6)}...{wallet.accounts[0].address.substring(38)}**</p>
            <p>Chain ID: **{wallet.chains[0].id}**</p>
            <button onClick={disconnect}>Disconnect Wallet</button>
          </div>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;