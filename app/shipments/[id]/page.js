"use client";

import { useWeb3 } from "@/app/context/Web3Context";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getShipmentByIdFunction,
  getWithdrawnFundsBySeller,
  fetchBalance,
  withdrawFundFunction,
} from "@/app/context/smartContract";
import { ethers } from "ethers";
import { ArrowLeftFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DONE from "./../../images/done.png";
import CANCEL from "./../../images/cancel.png";
import { motion } from "framer-motion";

export default function ShipmentByIdDetailsPage() {
  const { id } = useParams();
  const shipmentId = Number(id);
  const router = useRouter();
  const { contract, account, setBalance } = useWeb3();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  const getShipmentById = async (shipmentId) => {
    if (!contract || !account) return;

    setLoading(true);
    const res = await getShipmentByIdFunction(contract, shipmentId);
    const withdraw = await getWithdrawnFundsBySeller(
      contract,
      account,
      shipmentId
    );
    setWithdrawn(withdraw);
    setShipment(res);
    setLoading(false);
  };

  const withdrawFund = async (shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    setLoadingButton(true);
    await withdrawFundFunction(contract, shipmentId);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setLoadingButton(false);
  };

  useEffect(() => {
    if (contract && account) {
      getShipmentById(shipmentId);
    }
  }, [contract, account, shipmentId]);

  const formatTimestamp = (ts) =>
    ts ? new Date(Number(ts) * 1000).toLocaleString() : "Not set";

  const formatPrice = (wei) => ethers.formatEther(wei) + " ETH";

  const statusMap = [
    "Created",
    "Dispatched",
    "On Route",
    "Delivered",
    "Cancelled",
  ];

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>Loading shipment details...</p>
      </div>
    );

  if (!shipment)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>No shipment found!</p>
      </div>
    );

  if (!account) return null;

  const steps = [
    { label: "Pick Up", time: shipment.pickUpTime },
    { label: "Dispatch", time: shipment.dispatchTime },
    { label: "On Route", time: shipment.onRouteTime },
    { label: "Delivery", time: shipment.deliveryTime },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center">
      <div className="w-full max-w-5xl p-6">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-2 text-white hover:bg-gray-700"
        >
          <ArrowLeftFromLine /> Go Back
        </Button>
      </div>

      <h1 className="text-4xl font-extrabold mb-8 text-center">
        Shipment Details
      </h1>

      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p>
              <strong className="text-gray-400">Shipment ID:</strong>{" "}
              <span className="text-white">{shipment.id.toString()}</span>
            </p>
            <p>
              <strong className="text-gray-400">Seller:</strong>{" "}
              <span className="text-white">{shipment.seller}</span>
            </p>
            <p>
              <strong className="text-gray-400">Buyer:</strong>{" "}
              <span className="text-white">{shipment.buyer}</span>
            </p>
            <p>
              <strong className="text-gray-400">Distance:</strong>{" "}
              <span className="text-white">
                {parseFloat(Number(shipment.distance) / 1000)} km
              </span>
            </p>
            <div className="text-center">
              {
                <div className="text-center">
                  {Number(shipment.status) === 4 ? (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full font-semibold">
                      Cancelled - No withdraw
                    </span>
                  ) : shipment.isPaid ? (
                    Number(shipment.status) === 3 ? (
                      !withdrawn ? (
                        <Button
                          className={`px-4 py-2 rounded-full cursor-pointer font-semibold transition-colors duration-200 ${
                            loadingButton
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-400 text-white hover:text-black"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            withdrawFund(shipment.id);
                          }}
                          disabled={loadingButton}
                        >
                          {loadingButton ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Withdraw fund"
                          )}
                        </Button>
                      ) : (
                        <span className="px-3 py-1 bg-gray-400 text-white rounded-full font-semibold">
                          Withdrawn
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 bg-yellow-400 text-black rounded-full font-semibold">
                        Payment pending delivery
                      </span>
                    )
                  ) : (
                    <span className="px-3 py-1 bg-gray-300 text-black rounded-full font-semibold">
                      Not paid yet
                    </span>
                  )}
                </div>
              }
            </div>
          </div>
          <div className="space-y-3">
            {shipment.isPaid && shipment.deliveryTime && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 w-48 sm:w-60 md:w-72 lg:w-80 mx-auto md:ml-auto"
              >
                <div className="w-full aspect-square relative">
                  <Image
                    src={DONE}
                    alt="done"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </motion.div>
            )}
            {!shipment.isPaid && shipment.status == 4 && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 w-48 sm:w-60 md:w-72 lg:w-80 mx-auto md:ml-auto"
              >
                <div className="w-full aspect-square relative">
                  <Image
                    src={CANCEL}
                    alt="cancel"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            <strong className="text-gray-400">Price:</strong>{" "}
            <span className="text-green-400 font-semibold">
              {formatPrice(shipment.price)}
            </span>
          </p>
          <p>
            <strong className="text-gray-400">Status:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full font-semibold text-sm ${
                shipment.status == 0
                  ? "bg-yellow-600"
                  : shipment.status == 1
                  ? "bg-blue-600"
                  : shipment.status == 2
                  ? "bg-indigo-600"
                  : shipment.status == 3
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {statusMap[Number(shipment.status)]}
            </span>
          </p>
          <p>
            <strong className="text-gray-400">Paid:</strong>{" "}
            <span
              className={`font-semibold ${
                shipment.isPaid ? "text-green-400" : "text-red-400"
              }`}
            >
              {shipment.isPaid ? "Yes" : "No"}
            </span>
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Shipment Timeline
          </h2>
          <div className="relative w-full overflow-x-auto">
            <div className="flex gap-6 min-w-[500px]">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col items-center min-w-[120px] relative"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      step.time ? "bg-green-500" : "bg-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="mt-2 text-gray-300 font-medium">{step.label}</p>
                  <p className="text-white text-sm mt-1">
                    {step.time ? formatTimestamp(step.time) : "Not set"}
                  </p>

                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-25 w-25 h-1 bg-gray-600 z-0"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
