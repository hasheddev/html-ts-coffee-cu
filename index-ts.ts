import { 
  createWalletClient, 
  custom, 
  createPublicClient, 
  parseEther, 
  defineChain, 
  formatEther,
  WalletClient,
  PublicClient,
  Chain,
  Address
} from "viem";
import "viem/window"
import { contractAddress, abi } from "./constants-ts";


// Client variables with types
let walletClient: WalletClient;
let publicClient: PublicClient;

// Button elements
const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;

// Event listeners
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

function connect(): void {
  typeof window.ethereum !== "undefined" 
    ? getMetamask() 
    : connectButton.innerHTML = "Please install MetaMask";
}

async function fund(): Promise<void> {
  const amount = ethAmountInput.value;
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    const [account] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress as Address,
      abi,
      functionName: "fund",
      account,
      chain: currentChain,
      value: parseEther(amount),
    });
    
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function getMetamask(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
}
  await walletClient.requestAddresses();
  connectButton.innerHTML = "Connected!";
  connectButton.disabled = true;
}

async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });

    const balance = await publicClient.getBalance({
      address: contractAddress as Address
    });
    console.log(formatEther(balance));
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function withdraw(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    const [account] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);
    
    publicClient = createPublicClient({
      transport: custom(window.ethereum)
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress as Address,
      abi,
      functionName: "withdraw",
      account,
      chain: currentChain,
    });
    
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId();
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });
  return currentChain;
}