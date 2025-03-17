"use client";

import { useEffect, useState } from "react";
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

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('http://localhost:81/api/markets/attention/');
        if (!response.ok) {
          throw new Error('Failed to fetch markets');
        }
        const data = await response.json();
        setMarkets(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">Attention Markets</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore all available attention markets
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading markets...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : markets.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>No markets available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <div 
                key={market.id}
                className="block hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <Link href={`/explorer/${market.slug}`}>
                    <div className="flex items-center justify-center mb-4 h-40">
                      <Image
                        src={market.image_url}
                        alt={`${market.slug} logo`}
                        width={150}
                        height={150}
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2 capitalize">{market.slug}</h2>
                    </div>
                  </Link>
                  <div className="text-center">
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
