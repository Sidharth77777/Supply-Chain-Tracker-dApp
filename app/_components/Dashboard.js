"use client"

import { useState } from "react";
import { useWeb3 } from "../context/Web3Context"
import ShipmentBuyersTable from "./ShipmentBuyersTable";
import ShipmentForm from "./ShipmentForm";
import ShipmentTable from "./ShipmentTable";

export default function DashBoard() {
    const { account, setAccount, contract, setContract, balance, setBalance } = useWeb3();
    const [refreshTable, setRefreshTable] = useState(false);

    return (
        <div>
            <h1 className="sm:text-2xl text-center mb-5 sm:text-left text-xl font-bold">Supply Chain Dashboard</h1>
            
            <div className="mb-10">
                <ShipmentForm account={account} contract={contract} setBalance={setBalance} refreshTable={refreshTable} setRefreshTable={setRefreshTable} />
            </div>

            <div>
                <ShipmentTable account={account} contract={contract} setBalance={setBalance} refreshTable={refreshTable} setRefreshTable={setRefreshTable} />
            </div>

            <div className="mt-20">
                <ShipmentBuyersTable account={account} contract={contract} setBalance={setBalance} refreshTable={refreshTable} setRefreshTable={setRefreshTable} />
            </div>
        </div>

    )
}