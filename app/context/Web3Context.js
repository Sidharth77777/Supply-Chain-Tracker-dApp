"use client"

import { createContext, useContext, useState } from "react";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(null)

  return (
    <Web3Context.Provider value={{ account, setAccount, contract, setContract, balance, setBalance }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
