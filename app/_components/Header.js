"use client";

import { useWeb3 } from "../context/Web3Context";
import { Button } from "@/components/ui/button";
import { connectWalletFunction, fetchBalance } from "../context/smartContract";
import { LogOut, Wallet } from "lucide-react";
import Image from "next/image";
import ETH_SVG from "./../images/ethereum-original.svg"
import { useState } from "react";

export default function Header() {
  const { account, setAccount, contract, setContract, balance, setBalance } = useWeb3();
  const [loadBalance, setLoadBalance] = useState(false);

  const connectWallet = async () => {
    const [fetchAccount, fetchContract, fetchProvider] = await connectWalletFunction();
    setAccount(fetchAccount);
    setContract(fetchContract);

    setLoadBalance(true);
    const balance = await fetchBalance(fetchAccount, fetchProvider);
    if (balance) setBalance(balance.slice(0, 6));
    setLoadBalance(false);
  };

  const shortenAddress = (addr) =>
    addr ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : "";

  const logOutAll = () => {
    setAccount(null);
    setContract(null);
  };

  return (
    <header className="flex sm:flex-row flex-col items-center justify-between sm:h-16 px-6 py-3 bg-gray-900 text-white shadow-md">
      <h1 className="text-2xl mb-3 sm:mb-0 font-bold tracking-wide">
        🚚 Supply Chain DApp
      </h1>

      <div className="flex justify-between items-center gap-5">
        <Button
          variant="outline"
          onClick={connectWallet}
          className="cursor-pointer bg-white text-white hover:bg-gray-700"
        >
            <Wallet />
          {account ? shortenAddress(account) : "Connect Wallet"}
        </Button>

        {account ? (
          <div className="flex justify-between items-center gap-5">  
          <Button variant="outline" onClick={(e) => e.preventDefault()}><Image src={ETH_SVG} alt="SEPOLIA_ETH" className={`${loadBalance ? 'animate-spin' : '' }  h-5 w-5`} /> {balance}</Button>  
          <div title="Disconnect Wallet"><LogOut onClick={logOutAll} className="cursor-pointer text-red-600 hover:text-red-400" /></div>
          </div>
        ) : (
          ""
        )}
      </div>
    </header>
  );
}
