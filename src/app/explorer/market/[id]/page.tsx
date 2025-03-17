"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/app/utils/env";

interface Market {
  id: number;
  slug: string;
  image_url: string;
  address: string;
}

interface Trade {
  type: "buy" | "sell";
  sol_amount: number;
  token: string;
  token_amount: number;
  timestamp: number;
  signature: string;
  signer: string;
}

// Helper function to abbreviate address
const abbreviateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Format timestamp to relative time
const formatRelativeTime = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) {
    return `${diff}s ago`;
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diff / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

export default function MarketDetail() {
  const { id } = useParams();
  const [market, setMarket] = useState<Market | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketAndTrades = async () => {
      try {
        // Get markets to find the current one by id
        const marketsResponse = await fetch(getApiUrl('api/markets/attention/'));
        if (!marketsResponse.ok) {
          throw new Error('Failed to fetch markets');
        }
        const marketsData = await marketsResponse.json();
        const currentMarket = marketsData.find((m: Market) => m.id.toString() === id);
        
        if (!currentMarket) {
          throw new Error('Market not found');
        }
        
        setMarket(currentMarket);
        
        // Fetch trades using the market ID
        const tradesResponse = await fetch(getApiUrl(`api/markets/attention/trades/${id}`));
        if (!tradesResponse.ok) {
          throw new Error('Failed to fetch trades');
        }
        const tradesData = await tradesResponse.json();
        setTrades(tradesData);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    if (id) {
      fetchMarketAndTrades();
    }
  }, [id]);

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading market details...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : market ? (
        <>
          <header className="mb-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="h-32 w-32 relative mb-2">
                <Image
                  src={market.image_url}
                  alt={`${market.slug} logo`}
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold capitalize mb-2">{market.slug}</h1>
                <div>
                  <a 
                    href={`https://explorer.sonic.game/address/${market.address}?cluster=testnet.v1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {abbreviateAddress(market.address)} ↗
                  </a>
                </div>
              </div>
            </div>
          </header>

          <section className="mb-8 max-w-4xl mx-auto px-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Trading History</h2>
            {trades.length === 0 ? (
              <p className="text-gray-500 text-center">No trades found for this market.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SOL Amount</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Token Amount</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Agent</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {trades.map((trade, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                        <td className={`py-3 px-4 whitespace-nowrap ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="font-medium">{trade.type.toUpperCase()}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {trade.sol_amount.toFixed(8)} SOL
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {trade.token_amount.toFixed(8)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {formatRelativeTime(trade.timestamp)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <a 
                            href={`https://explorer.sonic.game/address/${trade.signer}?cluster=testnet.v1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {abbreviateAddress(trade.signer)}
                          </a>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <a
                            href={`https://explorer.sonic.game/tx/${trade.signature}?cluster=testnet.v1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="View transaction details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p>Market not found</p>
        </div>
      )}
    </div>
  );
} 