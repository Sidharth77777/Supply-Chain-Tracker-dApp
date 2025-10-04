import { toast } from "sonner";
import { ethers } from "ethers";
import { SMART_CONTRACT_DEPLOYED_ADDRESS ,SUPPLY_CHAIN_TRACKER_CONTRACT_ABI } from "./constants";

export const connectWalletFunction = async() => {
    if (!window.ethereum) {
        toast("Install Metamask first !", {
            action: {
                label: "Install",
                onClick: () => window.open("https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en", "_blank")
            }
        }
    ) 
        return [null, null, null];
    }

    try{
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await provider.send('eth_requestAccounts', []);

        const newContract = new ethers.Contract(SMART_CONTRACT_DEPLOYED_ADDRESS, SUPPLY_CHAIN_TRACKER_CONTRACT_ABI, signer);

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // SEPOLIA
        });

        return [accounts[0], newContract, provider];

    } catch(err) {
        if (err.code === 4902) {
            await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                chainId: "0xaa36a7",
                chainName: "Sepolia Testnet",
                rpcUrls: ["https://rpc.sepolia.org"],
                nativeCurrency: { name: "SepoliaETH", symbol: "SEP", decimals: 18 },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
            ],
            });
        }
        toast.error('Error connecting Wallet !');
        console.error("Error connecting Wallet !");
        return [null, null, null];
    }
}

export const fetchBalance = async(account, provider) => {
    if (!account || !provider) return null;

    try {
        const balanceInWei = await provider.getBalance(account);
        const balance = ethers.formatEther(balanceInWei);

        return balance;

    } catch(err) {
        toast.error("Error fetching balance !")
        console.error("Error fetching balance !");
        return null;
    }
}

export const createShipmentFunction = async(contract , buyer, pickUpTime, distance, price, setCreatingShipment, setBuyerAddress, setDateTime, setDistance, setPrice) => {
    //if (!account || !contract) return;
    //setLoading(true)

    try{
        const priceInWei = ethers.parseEther(price);
        const pickUpTimeInSeconds = Math.floor(new Date(pickUpTime).getTime() / 1000);
        const distanceInInteger = Math.floor(Number(distance) * 1000);
        const tx = await contract.createShipment(buyer, pickUpTimeInSeconds, distanceInInteger, priceInWei);
        await tx.wait();
        
        toast.success('Shipment created successfully!');
        setCreatingShipment(false);
        setBuyerAddress('');
        setDateTime('');
        setDistance('');
        setPrice('');
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        setCreatingShipment(false);
        if (!buyer || !pickUpTime || !distance || !price) {
            toast.error('Fill all the input fields !');
        } else {
            toast.error('Error creating shipment !');
        }
        console.error("Error creating shipment !",err);
    }
}

export const dispatchShipmentFunction = async(contract, shipmentId) => {
    //if (!account || !contract) return;
    //setLoading(true)
    try {
        const tx = await contract.dispatchShipment(shipmentId);
        await tx.wait();

        toast.success('Shipment dispatched successfully!');
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error dispatching shipment !');
        console.error("Error dispatching shipment !",err);
    }
}

export const markOnRouteFunction = async(contract, shipmentId) => {
    //if (!account || !contract) return;
    //setLoading(true)
    try {
        const tx = await contract.markOnRoute(shipmentId);
        await tx.wait();

        toast.success('Shipment started transporting successfully!');
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error transporting shipment !');
        console.error("Error transporting shipment !",err);
    }
}

export const completeShipmentFunction = async(contract, shipmentId) => {
    //if (!account || !contract) return;
    //setLoading(true)
    try {
        const tx = await contract.completeShipment(shipmentId);
        await tx.wait();

        toast.success('Shipment completed successfully!');
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error completing shipment !');
        console.error("Error completing shipment !",err);
    }
}

export const payShipmentFunction = async(contract, shipmentId) => {
    // if(!account || !contract) return;
    //setLoading(true)

    try{
        const shipment = await contract.shipments(shipmentId);
        const tx = await contract.payShipment(shipmentId, { value: shipment.price });
        await tx.wait()

        toast.success('Payment completed successfully!');
        //setLoading(false)
    } catch(err) {  
        //setLoading(false)
        toast.error('Error paying shipment !');
        console.error("Error paying shipment !",err);
    }
}

export const cancelShipmentFunction = async(contract, shipmentId) => {
    // if(!account || !contract) return;
    //setLoading(true)

    try{
        const tx = await contract.cancelShipment(shipmentId);
        await tx.wait()

        toast.success('Cancelled Shipment successfully!');
        //setLoading(false)
    } catch(err) {  
        //setLoading(false)
        toast.error('Error cancelling shipment !');
        console.error("Error cancelling shipment !",err);
    }
}

export const withdrawFundFunction = async(contract, shipmentId) => {
    // if (!account || !contract) return;
    //setLoading(true)

    try{
        const tx = await contract.withdrawFund(shipmentId);
        await tx.wait()

        toast.success('Fund Withdrawn successfully!');
        //setLoading(false)
    } catch(err) {  
        //setLoading(false)
        if (err.reason == "Already withdrawn !") {
            toast.error(err.reason);
        } else if (err.reason == "Only seller can withdraw !") {
            toast.error(err.reason);
        } else {toast.error('Error withdrawing fund !');}
        
        console.error("Error withdrawing fund !",err);
    }
}

export const getTotalShipmentCountsFunction = async(contract) => {
    // if(!account || !contract) return null;
    //setLoading(true)

    try {
        const totalShipmentCount = await contract.getTotalShipmentCounts();
        return totalShipmentCount;
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error getting total Shipment count !');
        console.error("Error getting total Shipment count !",err);
        return null;
    }
}

export const getAllShipmentsFunction = async(contract) => {
    // if(!account || !contract) return [];
    //setLoading(true)

    try {
        const allShipments = await contract.getAllShipments();
        return allShipments;
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error getting total Shipment count !');
        console.error("Error getting total Shipment count !",err);
        return [];
    }
}

export const getShipmentByIdFunction = async(contract, shipmentId) => {
    // if(!account || !contract) return [];
    //setLoading(true)

    try {
        const id = BigInt(shipmentId)
        const shipment = await contract.getShipmentById(id);
        return shipment;
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error getting Shipment !');
        console.error("Error getting Shipment !",err);
        return [];
    }
}

export const getShipmentsOfBuyerFunction = async(contract) => {
    // if(!account || !contract) return [];
    //setLoading(true)

    try {
        const shipmentsOfBuyer = await contract.getShipmentsOfBuyer();
        return shipmentsOfBuyer;
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error getting total Shipment count !');
        console.error("Error getting total Shipment count !",err);
        return [];
    }
}

export const getShipmentsOfSellerFunction = async(contract) => {
    // if(!account || !contract) return [];
    //setLoading(true)

    try {
        const shipmentsOfSeller = await contract.getShipmentsOfSeller();
        return shipmentsOfSeller;
        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error getting total Shipment count !');
        console.error("Error getting total Shipment count !",err);
        return [];
    }
}

export const getWithdrawnFundsBySeller = async(contract, account, shipmentId) => {
    // if(!account || !contract) return null;
    //setLoading(true)

    try{
        const withdrawn = await contract.withdrawnFundsBySeller(account, shipmentId);
        return withdrawn;

        //setLoading(false)
    } catch(err) {
        //setLoading(false)
        toast.error('Error getting fund withdraw details !');
        console.error("Error getting fund withdraw details !",err);
        return null;
    }
    
}
