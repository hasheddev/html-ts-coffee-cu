import { createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther, isAddress } from "https://esm.sh/viem"
import { contractAddress, abi } from "./constants-js.js"

let walletClient, publicClient
const connectButton = document.getElementById("connectButton")
connectButton.onclick = connect
const fundButton = document.getElementById("fundButton")
fundButton.onclick = fund
const balanceButton = document.getElementById("balanceButton")
balanceButton.onclick = getBalance
const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw
const ethAmountInput = document.getElementById("ethAmount")
const addressBalanceButton = document.getElementById("addressBalanceButton")
addressBalanceButton .onclick = getAddressBalance
const addressInput = document.getElementById("address")
const donationBalance = document.getElementById("myBalanceButton")
donationBalance.onclick = getMyAddressBalance

function connect() {
   typeof window.ethereum !== "undefined" ? getMetamask() : connectButton.innerHTML = "Please install metamask"
}

async function fund() {
    const amount= ethAmountInput.value
    if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        const [account] = await walletClient.requestAddresses()
        const currentChain = await getCurrentChain(walletClient)

        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        })

       const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi,
            functionName: "fund",
            account,
            chain: currentChain,
            value: parseEther(amount),
        })
        const hash = await walletClient.writeContract(request)
        console.log(hash)
        
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getMetamask() {
    walletClient = createWalletClient({
        transport: custom(window.ethereum)
    })
    await walletClient.requestAddresses()
    connectButton.innerHTML = "Connected!"
    connect.disabled = true
}

async function getBalance() {
    if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
    
        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        })

       const balance = await publicClient.getBalance({
        address: contractAddress
       })
        console.log(formatEther(balance))
        
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function withdraw() {
    if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        const [account] = await walletClient.requestAddresses()
        const currentChain = await getCurrentChain(walletClient)
        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        })
       const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi,
            functionName: "withdraw",
            account,
            chain: currentChain,
        })
        const hash = await walletClient.writeContract(request)
        console.log(hash)
        
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getMyAddressBalance() {
     if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        const [account] = await walletClient.requestAddresses()

        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        })
    
        const data = await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "getAddressToAmountFunded",
            args: [account]
        })
        console.log(formatEther(data))
    }
    else {
         connectButton.innerHTML = "Please install metamask"
    }
}

async function getAddressBalance() {
    const addressToQuery = addressInput.value
    if(!isAddress(addressToQuery)) {
        addressBalanceButton.innerHTML = "Please Enter valid address"
        setTimeout(() => {
            addressBalanceButton.innerHTML = "Query balance"
        }, 2000)
        return
    }

    if(typeof window.ethereum !== "undefined") {
        const publicClient = createPublicClient({
            transport: custom(window.ethereum)
        })
        const data = await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "getAddressToAmountFunded",
            args: [addressToQuery]
        })
        console.log(formatEther(data))
    }
    else {
         connectButton.innerHTML = "Please install metamask"
    }
    
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
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
  })
  return currentChain
}