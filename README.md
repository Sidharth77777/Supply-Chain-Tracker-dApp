# 🚚 Supply Chain Tracker DApp

[Live Demo](https://supply-chain-tracker-dapp.vercel.app)  
[Smart Contract on Etherscan](https://sepolia.etherscan.io/address/0xcDa8e7017e9DE650965315F563FE8cB981575eB8)

A decentralized application (DApp) for managing and tracking shipments on the Ethereum Sepolia testnet. This DApp enables sellers and buyers to interact with a smart contract that ensures transparent shipment tracking, secure payments, and automated fund withdrawals upon successful delivery.

---

## Features

- **Connect Wallet:** Connect your MetaMask wallet to the DApp.
- **Create Shipments:** Sellers can create shipments with buyer, distance, price, and pickup time.
- **Track Shipments:** Follow a timeline of shipment progress — Pick Up → Dispatch → On Route → Delivery.
- **View Shipment Details:** See shipment ID, seller, buyer, price, distance, and status.
- **Payment Management:** Buyers can pay in ETH for their shipments.
- **Withdraw Funds:** Sellers can withdraw funds after successful delivery.
- **Cancelled Shipments:** Funds cannot be withdrawn if a shipment is cancelled.
- **Responsive UI:** Fully responsive design with smooth animations.
- **Explorer Links:** View contract and transactions directly on [Etherscan](https://sepolia.etherscan.io/).

---

## Requirements

- **MetaMask Wallet:** Must be connected to the Sepolia testnet.  
- **Sepolia ETH:** Required to pay for gas fees. Get test ETH from the [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia).

---

## Screenshots

![Connect Wallet](https://drive.usercontent.google.com/download?id=15DQpQNvlThmWWbr_gX6OOP-eTq-GRcCF&export=view&authuser=0)  
*Connect your MetaMask wallet to get started.*

---

![Supply Chain Dashboard](https://drive.usercontent.google.com/download?id=1gCyh4-sXK40uL9iX0hvZT-cpyuJKqifi&export=view&authuser=0)  
*Overview of shipments and their progress.*

---

![Your Purchases Table](https://drive.usercontent.google.com/download?id=1L051Ab9AjV6o2ePAeh3TFbONdlIObyKx&export=view&authuser=0)  
*Track all your purchased shipments in one place.*

---

![Shipment Details](https://drive.usercontent.google.com/download?id=1yHWzV9q-KE_F41m5jdcVmnh9CyzxYmZW&export=view&authuser=0)  
*Detailed view of a shipment including seller, buyer, status, and withdraw option.*

---

## Technologies Used

- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion  
- **Smart Contract:** Solidity (Shipment + Payments + Withdrawals)  
- **Wallet Integration:** MetaMask, Ethers.js  
- **Blockchain:** Ethereum Sepolia Testnet  
- **Deployment:** Vercel  

---

## Smart Contract Details

- **Contract Name:** SupplyChainTracker  
- **Deployed Address:** [0xcDa8e7017e9DE650965315F563FE8cB981575eB8](https://sepolia.etherscan.io/address/0xcDa8e7017e9DE650965315F563FE8cB981575eB8)  
- **Shipment Lifecycle:** Created → Dispatched → On Route → Delivered → Cancelled  
- **Withdrawals:** Sellers can only withdraw funds once per shipment and only after delivery.  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Sidharth77777/Supply-Chain-Tracker-dApp.git
cd Supply-Chain-Tracker-dApp
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)  in your browser


## Contributing
 Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.


 ## Contact
 Developer: Sidharth K S
 Github: [https://github.com/Sidharth77777](https://github.com/Sidharth77777)
 X: [https://x.com/cryptoSid1564](https://x.com/cryptoSid1564)
