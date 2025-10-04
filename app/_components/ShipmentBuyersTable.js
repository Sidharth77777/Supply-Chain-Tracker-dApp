"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  payShipmentFunction,
  getShipmentsOfBuyerFunction,
  fetchBalance,
  cancelShipmentFunction,
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

export default function BuyerShipmentTable({ account, contract, setBalance, refreshTable, setRefreshTable }) {
  const router = useRouter();
  const STATUS_LABELS = ["CREATED", "DISPATCHED", "ON_ROUTE", "DELIVERED", "CANCELLED"];
  const [yourShipments, setYourShipments] = useState([]);
  const [yourShipmentCount, setYourShipmentCount] = useState("");
  const [query, setQuery] = useState("");
  const [loadingFunction, setLoadingFunction] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getShipmentsOfBuyer = async (contract) => {
    if (!contract) return;
    const res = await getShipmentsOfBuyerFunction(contract);
    if (res) setYourShipments([...res].sort((a, b) => Number(b.id) - Number(a.id)));
    setYourShipmentCount(res.length);
  };

  const searchedShipments = yourShipments.filter((s) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return s.id.toString() === q || s.seller.toLowerCase() === q;
  });

  useEffect(() => {
    account && getShipmentsOfBuyer(contract);
  }, [account, contract, refreshTable]);

  const totalPages = Math.ceil(searchedShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredShipments = searchedShipments.slice(startIndex, endIndex);

  const formatAddress = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "");

  const formatTimestamp = (ts) => {
    if (!ts || ts === 0) return "-";
    const s = Number(ts);
    return new Date(s * 1000).toLocaleString();
  };

  const payShipment = async (shipmentId, price) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    const key = `${shipmentId}-pay`;
    setLoadingFunction((prev) => ({ ...prev, [key]: true }));
    await payShipmentFunction(contract, shipmentId);
    await getShipmentsOfBuyer(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setLoadingFunction((prev) => ({ ...prev, [key]: false }));
    setRefreshTable(!refreshTable);
  };

  const cancelShipment = async (shipmentId) => {
    if (!contract || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);

    const key = `${shipmentId}-cancel`;
    setLoadingFunction((prev) => ({ ...prev, [key]: true }));
    await cancelShipmentFunction(contract, shipmentId);
    await getShipmentsOfBuyer(contract);
    const newBalance = await fetchBalance(account, provider);
    if (newBalance) setBalance(newBalance.slice(0, 6));
    setLoadingFunction((prev) => ({ ...prev, [key]: false }));
    setRefreshTable(!refreshTable);
  };

  return (
    <div className="bg-[#18181b] px-10 py-3 rounded-2xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="sm:text-lg font-bold">Your Purchases</h2>
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
                <td className={`p-2 ${(!r.isPaid && r.status != 4) && 'text-red-600'}`}>{r.isPaid ? "Yes" : "No"}</td>
                <td className="p-2">
                  <div className="flex gap-5 items-center">
                    {!r.isPaid && r.status != 4 ? (
                      <Button
                        size="sm"
                        isLoading={loadingFunction[`${r.id}-pay`] || false}
                        className="cursor-pointer w-17"
                        onClick={(e) => {
                          e.preventDefault();
                          payShipment(r.id, r.price);
                        }}
                      >
                        {loadingFunction[`${r.id}-pay`] ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Pay"
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="cursor-pointer w-17"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`shipments/${r.id}`);
                        }}
                      >
                        Details
                      </Button>
                    )}

                    {r.status != 3 && r.status != 4 && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          cancelShipment(r.id);
                        }}
                        variant="destructive"
                        isLoading={loadingFunction[`${r.id}-cancel`] || false}
                        className="cursor-pointer px-2 py-1 w-17 bg-zinc-700 rounded"
                      >
                        {loadingFunction[`${r.id}-cancel`] ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Cancel"
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
                  No shipments found!
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
                  className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
                } else if (page === currentPage - 2 || page === currentPage + 2) {
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
                  className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
