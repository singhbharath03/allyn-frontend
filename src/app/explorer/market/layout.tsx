import React from "react";

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="market-layout">
      {children}
    </div>
  );
}

export const metadata = {
  title: "Market Details | Attention Markets",
  description: "View detailed information and trading history for attention markets",
}; 