"use client";

import { connectWalletFunction, fetchBalance } from "../context/smartContract";
import { useWeb3 } from "../context/Web3Context";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function LandingPage() {
  const { account, setAccount, contract, setContract, balance, setBalance } = useWeb3();

  const connectWallet = async () => {
    const [fetchAccount, fetchContract, fetchProvider] = await connectWalletFunction();
    setAccount(fetchAccount);
    setContract(fetchContract);

    const balance = await fetchBalance(fetchAccount, fetchProvider);
    if (balance) setBalance(balance.slice(0, 6));
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6 overflow-hidden">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
          🚚 Blockchain-Powered <span className="text-indigo-400">Supply Chain</span>
        </h1>
        <h3 className="text-lg text-gray-300">
          Track shipments, manage payments, and ensure transparency with smart contracts.
        </h3>

        <div className="pt-6">
          <Button
            onClick={connectWallet}
            className="cursor-pointer px-8 py-8 text-lg rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-all"
          >
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : <div className="flex justify-between items-center gap-2"><Wallet />Connect Wallet</div>}
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 text-gray-500 text-sm">
        Built on <span className="text-indigo-400 font-semibold">Sepolia Testnet</span>
      </div>
    </div>
  );
}
