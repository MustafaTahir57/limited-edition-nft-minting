import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, http, createConfig } from "wagmi";
import { mainnet, polygon, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { bscTestnet } from "./chains";
import { walletConnect, injected, metaMask, coinbaseWallet } from "wagmi/connectors";

const projectId = "a35691f011761d63c1dd60354147a840";

const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "YourApp",
      // appLogoUrl: "https://yourapp.com/icon.png", // optional
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "YourApp",
        description: "Your App description",
        url: window.location.origin,
        icons: ["https://yourapp.com/icon.png"],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    // [bscTestnet.id]: http("https://eth.llamarpc.com"), // ✅ Ethereum Mainnet public RPC
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"), // ✅ test public RPC
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
