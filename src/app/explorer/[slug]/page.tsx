"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Market {
  id: number;
  slug: string;
  image_url: string;
  address: string;
}

// Helper function to abbreviate address
const abbreviateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export default function ExplorerPage() {
  const { slug } = useParams();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        // Fetch all markets and find the one matching the slug
        const response = await fetch('http://localhost:81/api/markets/attention/');
        if (!response.ok) {
          throw new Error('Failed to fetch markets');
        }
        const markets = await response.json();
        const foundMarket = markets.find((m: Market) => m.slug === slug);
        
        if (foundMarket) {
          setMarket(foundMarket);
        } else {
          setError('Market not found');
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    if (slug) {
      fetchMarket();
    }
  }, [slug]);

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-500 hover:underline mb-8 inline-block">
          &larr; Back to all markets
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading market details...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : market ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center justify-center w-40 h-40">
                  <Image
                    src={market.image_url}
                    alt={`${market.slug} logo`}
                    width={150}
                    height={150}
                    className="max-h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-4 capitalize">{market.slug}</h1>
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Market Address:</h2>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://explorer.sonic.game/address/${market.address}?cluster=testnet.v1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {abbreviateAddress(market.address)}
                      </a>
                      <a 
                        href={`https://explorer.sonic.game/address/${market.address}?cluster=testnet.v1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      >
                        View on Sonic Explorer
                      </a>
                    </div>
                  </div>
                  
                  {/* Additional details can be added here as needed */}
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Market Explorer</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      This is the explorer page for the {market.slug} attention market.
                      Additional market details and visualizations can be added here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>Market not found</p>
          </div>
        )}
      </div>
    </div>
  );
} 