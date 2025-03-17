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
  succeeded: boolean;
  signer: string;
}

// Helper function to abbreviate address
const abbreviateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Format timestamp to readable date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export default function MarketDetail() {
  const { slug } = useParams();
  const [market, setMarket] = useState<Market | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketAndTrades = async () => {
      try {
        // Get markets to find the current one by slug
        const marketsResponse = await fetch(getApiUrl('api/markets/attention/'));
        if (!marketsResponse.ok) {
          throw new Error('Failed to fetch markets');
        }
        const marketsData = await marketsResponse.json();
        const currentMarket = marketsData.find((m: Market) => m.slug === slug);
        
        if (!currentMarket) {
          throw new Error('Market not found');
        }
        
        setMarket(currentMarket);
        
        // Fetch trades directly using the slug
        const tradesResponse = await fetch(getApiUrl(`api/markets/attention/trades/${slug}`));
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

    if (slug) {
      fetchMarketAndTrades();
    }
  }, [slug]);

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
          <header className="mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 relative">
                  <Image
                    src={market.image_url}
                    alt={`${market.slug} logo`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold capitalize">{market.slug}</h1>
                  <div>
                    <a 
                      href={`https://explorer.sonic.game/address/${market.address}?cluster=testnet.v1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {abbreviateAddress(market.address)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Trading History</h2>
            {trades.length === 0 ? (
              <p className="text-gray-500">No trades found for this market.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SOL Amount</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Token Amount</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Signer</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
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
                          {formatDate(trade.timestamp)}
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
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trade.succeeded ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {trade.succeeded ? 'Succeeded' : 'Failed'}
                          </span>
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