"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  completeShipmentFunction,
  dispatchShipmentFunction,
  getShipmentsOfSellerFunction,
  markOnRouteFunction,
  fetchBalance,
  cancelShipmentFunction,
  withdrawFundFunction
} from "../context/smartContract";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

export default function ShipmentTable({
  account,
  contract,
  setBalance,
  refreshTable,
  setRefreshTable,
}) {
  const router = useRouter();
  const STATUS_LABELS = [
    "CREATED",
    "DISPATCHED",
    "ON_ROUTE",
    "DELIVERED",
    "CANCELLED",
  ];
  const [yourShipments, setYourShipments] = useState([]);
  const [yourShipmentCount, setYourShipmentCount] = useState("");
  const [query, setQuery] = useState("");
  const [loadingFunction, setLoadingFunction] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getShipmentsOfSeller = async (contract) => {
    if (!contract) return;

    const res = await getShipmentsOfSellerFunction(contract);
    if (res) setYourShipments([...res].sort((a, b) => Number(b.id) - Number(a.id)));

    setYourShipmentCount(res.length);
  };

  const searchedShipments = yourShipments.filter((s) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return s.id.toString() === q || s.buyer.toLowerCase() === q;
  });

  useEffect(() => {
    account && getShipmentsOfSeller(contract);
  }, [account, contract, refreshTable]);

  const totalPages = Math.ceil(searchedShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredShipments = searchedShipments.slice(startIndex, endIndex);

  const formatAddress = (a) =>
    a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";

  const formatTimestamp = (ts) => {
    if (!ts || ts === 0) return "-";
    const s = Number(ts);
    return new Date(s * 1000).toLocaleString();
  };

  const isSeller = (r) =>
    account && r.seller?.toLowerCase() === account?.toLowerCase();

  const setActionLoading = (shipmentId, action, value) => {
    setLoadingFunction((prev) => ({
      ...prev,
      [shipmentId]: { ...(prev[shipmentId] || {}), [action]: value },
    }));
  };

  const dispatchShipment = async (shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    setActionLoading(shipmentId, "dispatch", true);
    await dispatchShipmentFunction(contract, shipmentId);
    await getShipmentsOfSeller(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setActionLoading(shipmentId, "dispatch", false);
    setRefreshTable(!refreshTable);
  };

  const markOnRoute = async (shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    setActionLoading(shipmentId, "onRoute", true);
    await markOnRouteFunction(contract, shipmentId);
    await getShipmentsOfSeller(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setActionLoading(shipmentId, "onRoute", false);
    setRefreshTable(!refreshTable);
  };

  const completeShipment = async (shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    setActionLoading(shipmentId, "complete", true);
    await completeShipmentFunction(contract, shipmentId);
    await getShipmentsOfSeller(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setActionLoading(shipmentId, "complete", false);
    setRefreshTable(!refreshTable);
  };

  const cancelShipment = async (shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    setActionLoading(shipmentId, "cancel", true);
    await cancelShipmentFunction(contract, shipmentId);
    await getShipmentsOfSeller(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setActionLoading(shipmentId, "cancel", false);
    setRefreshTable(!refreshTable);
  };

  const withdrawFund = async(shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    setActionLoading(shipmentId, "withdraw", true);
    await withdrawFundFunction(contract, shipmentId);
    await getShipmentsOfSeller(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setActionLoading(shipmentId, "withdraw", false);
    setRefreshTable(!refreshTable);
  }

  return (
    <div className="bg-[#18181b] px-10 py-3 rounded-2xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="sm:text-lg font-bold">Your Shipments</h2>
        <span className="opacity-50">{yourShipmentCount} shipment</span>
      </div>
      <div className="flex justify-center items-center mb-5">
        <Input
          placeholder="Search by ADDRESS or ID ..."
          className="sm:w-1/2 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left mt-3 text-sm border-separate border-spacing-0">
          <thead className="text-zinc-300 text-xs">
            <tr className="border-b border-white">
              <th className="p-2">ID</th>
              <th className="p-2">SELLER</th>
              <th className="p-2">BUYER</th>
              <th className="p-2">PICKUP</th>
              <th className="p-2">DISTANCE (km)</th>
              <th className="p-2">PRICE (ETH)</th>
              <th className="p-2">STATUS</th>
              <th className="p-2">PAID</th>
              <th className="p-2">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredShipments?.map((r) => (
              <tr key={r.id} className="border-t border-zinc-800">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{formatAddress(r.seller)}</td>
                <td className="p-2">{formatAddress(r.buyer)}</td>
                <td className="p-2">{formatTimestamp(r.pickUpTime)}</td>
                <td className="p-2">{parseFloat(Number(r.distance) / 1000)}</td>
                <td className="p-2">{ethers.formatEther(r.price)}</td>
                <td className="p-2">
                  <span
                    className={`inline-block px-2 py-1 ${
                      r.status == 0
                        ? "bg-yellow-600"
                        : r.status == 2
                        ? "bg-indigo-600"
                        : r.status == 3
                        ? "bg-green-600"
                        : r.status == 4
                        ? "bg-red-600"
                        : "bg-zinc-500"
                    } text-black rounded`}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td className={`p-2 ${r.isPaid && 'text-green-600'}`}>{r.isPaid ? "Yes" : "No"}</td>
                <td className="p-2">
                  <div className="flex gap-5 items-center">
                    {isSeller(r) && r.status == 0 && (
                      <Button
                        className='cursor-pointer'
                        size="sm"
                        isLoading={loadingFunction[r.id]?.dispatch || false}
                        onClick={(e) => {
                          e.preventDefault();
                          dispatchShipment(r.id);
                        }}
                      >
                        {loadingFunction[r.id]?.dispatch ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Dispatch"
                        )}
                      </Button>
                    )}
                    {isSeller(r) && r.status == 1 && (
                      <Button
                        className='cursor-pointer'
                        size="sm"
                        isLoading={loadingFunction[r.id]?.onRoute || false}
                        onClick={(e) => {
                          e.preventDefault();
                          markOnRoute(r.id);
                        }}
                      >
                        {loadingFunction[r.id]?.onRoute ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "On Route"
                        )}
                      </Button>
                    )}
                    {isSeller(r) && r.status == 2 && (
                      <Button
                        className='cursor-pointer'
                        size="sm"
                        isLoading={loadingFunction[r.id]?.complete || false}
                        onClick={(e) => {
                          e.preventDefault();
                          completeShipment(r.id);
                        }}
                      >
                        {loadingFunction[r.id]?.complete ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Complete"
                        )}
                      </Button>
                    )}
                    {(isSeller(r) && r.status != 3 && r.status != 4) && (
                      <Button
                        className='cursor-pointer'
                        variant="destructive"
                        isLoading={loadingFunction[r.id]?.cancel || false}
                        onClick={(e) => {
                          e.preventDefault();
                          cancelShipment(r.id);
                        }}
                      >
                        {loadingFunction[r.id]?.cancel ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Cancel"
                        )}
                      </Button>
                    )}
                    {(isSeller(r) && r.status == 3 && r.isPaid) && (
                      <Button
                        className='cursor-pointer bg-green-500 text-white hover:bg-green-400 hover:text-black'
                        size="sm"
                        isLoading={loadingFunction[r.id]?.complete || false}
                        onClick={(e) => {
                          e.preventDefault();
                          withdrawFund(r.id);
                        }}
                      >
                        {loadingFunction[r.id]?.withdraw ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Withdraw Fund"
                        )}
                      </Button>
                    )}
                    {((isSeller(r) && r.status == 3) || r.status == 4) && (
                      <Button
                        className='cursor-pointer'
                        size="sm"
                        isLoading={loadingFunction[r.id]?.details || false}
                        onClick={(e) => {
                          e.preventDefault();
                          setActionLoading(r.id, "details", true);
                          router.push(`shipments/${r.id}`);
                          setTimeout(() => setActionLoading(r.id, "details", false), 500);
                        }}
                      >
                        {loadingFunction[r.id]?.details ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Details"
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {yourShipments.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4 text-center text-zinc-400">
                  No shipments found !
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={
                    currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                  }
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;

                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <span className="px-2">…</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={
                    currentPage === totalPages
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
