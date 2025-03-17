import React from "react";

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="explorer-layout">
      {children}
    </div>
  );
}

export const metadata = {
  title: "Market Explorer | Attention Markets",
  description: "Explore attention markets details and analytics",
}; 