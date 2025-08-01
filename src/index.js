import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, http, createConfig } from "wagmi";
import { mainnet, polygon, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { bscTestnet } from "./chains";
import { walletConnect, injected, metaMask } from "wagmi/connectors";

const projectId = "a35691f011761d63c1dd60354147a840";

const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    injected(),
    metaMask(),
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
    //  [mainnet.id]: http(),
    // [polygon.id]: http(),
    // [optimism.id]: http(),
    // // [bscMainnet.id]: http("https://bsc-dataseed.binance.org"),
     [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"),
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
