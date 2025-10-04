"use client"

import { useState } from "react"
import { createShipmentFunction, fetchBalance } from "../context/smartContract"
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { ethers } from "ethers";

export default function ShipmentForm({ account, contract, setBalance, refreshTable, setRefreshTable }) {
    const [buyerAddress, setBuyerAddress] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [distance, setDistance] = useState('');
    const [price, setPrice] = useState('');

    const [creatingShipment, setCreatingShipment] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const createShipment = async(e) => {
        e.preventDefault();
        if (!account || !contract) return;

        const provider = new ethers.BrowserProvider(window.ethereum);

        setCreatingShipment(true);
        
        await createShipmentFunction(contract, buyerAddress, dateTime, distance, price, setCreatingShipment, setBuyerAddress, setDateTime, setDistance, setPrice);
        const newBalance = await fetchBalance(account, provider);
        if (newBalance) setBalance(newBalance.slice(0,6));

        setRefreshTable(!refreshTable);
    }


    return(
        <div className="bg-[#18181b] px-10 py-3 rounded-2xl">
        <div className="flex justify-between items-center">
            <h1 className="px-3 sm:text-left text-center sm:text-lg font-bold">Create Shipment</h1>
            <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer md:hidden" title="Create New Shipment">{!showForm ? "➕ Create" : "✖️ Close"}</Button>
        </div>

            <div className={`${showForm ? 'block' : 'hidden' } md:block`}>
            <form onSubmit={createShipment} className="flex justify-between md:flex-row flex-col items-center">
                <div className="p-3 h-15 md:w-1/4 w-full">
                    <input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} placeholder="Buyer Address" className=" border h-full p-3 bg-[#27272a] rounded w-full border-[#3f3f47]" />
                </div>

                <div className="p-3 h-15 md:w-1/4 w-full">
                    <input value={dateTime} type="datetime-local" onChange={(e) => setDateTime(e.target.value)} placeholder="Buyer Address" className=" border h-full p-3 bg-[#27272a] rounded w-full border-[#3f3f47]" />
                </div>

                <div className="p-3 h-15 md:w-1/4 w-full">
                    <input value={distance} type="number" onChange={(e) => setDistance(e.target.value)} placeholder="Distance (km)" className=" border h-full p-3 bg-[#27272a] rounded w-full border-[#3f3f47]" />
                </div>

                <div className="p-3 h-15 md:w-1/4 w-full">
                    <input value={price} type="number" onChange={(e) => setPrice(e.target.value)} placeholder="Price (Sepolia ETH)" className=" border h-full p-3 bg-[#27272a] rounded w-full border-[#3f3f47]" />
                </div>
                
                
                <Button disabled={!buyerAddress || !dateTime || !distance || !price} type='submit' className='md:mt-0 mt-3 cursor-pointer w-full  md:w-auto'>{!creatingShipment && <PackagePlus />}{ creatingShipment ? <span className="loading loading-spinner loading-xs"></span> : "Create"}</Button>
            </form> 
        </div>

        </div>
    )
}