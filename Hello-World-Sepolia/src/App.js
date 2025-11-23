import logo from './logo.svg';
import './App.css';
import Onboard from '@web3-onboard/core'
import metamaskSDK from '@web3-onboard/metamask'
import { useState, useEffect } from 'react'; // Import React hooks
import { deploy_contract } from './Blockchain/Deploy';
import { interact } from './Blockchain/Interact';
// --- Configuration ---
const INFURA_ID = 'e58130da3dee4d6c9f1ab1df59cbe8aa'

const chains = [
  {
    id: 1,
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}` 
  }
]

const metamaskSDKWallet = metamaskSDK({options: {
  extensionOnly: false,
  dappMetadata: {
    name: 'Demo Web3Onboard'
  }
}})
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
  const [contractAddress, setContractAddress] = useState(null);
  const [return_value, setreturn_value] = useState(null);

  const [wallet, setWallet] = useState(null); 
  const connect = async () => {
    const wallets = await onboard.connectWallet();
    
    if (wallets[0]) {
      setWallet(wallets[0]);
    }
  };

const handleDeploy = async () => {
  try {
    const address = await deploy_contract();
    setContractAddress(address); 
  } catch (err) {
    console.error(err);
  }
};

const handleinteract=async () => {
  if (!contractAddress){
    alert("contract is not deployed")
  }
  try {
    const hello = await interact(contractAddress);
    setreturn_value(hello); 
  } catch (err) {
    console.error(err);
  }
}
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
        <h1>Hello World</h1>
        {wallet ? (
          <div>
            <p>Wallet Connected</p>
          </div>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      <button onClick={handleDeploy}>Deploy Contract</button>
      {contractAddress && (
        <div>
        <p>Deployed at: {contractAddress}</p>
        <button onClick={handleinteract}>Hi</button>
        {
          return_value &&(
          <p>Contract says {return_value}</p>
          )
        }
        </div>
      )}
      </header>
    </div>
  );
}

export default App;