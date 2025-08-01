import { bscTestnet } from "./chains";
import { walletConnect, injected } from "wagmi/connectors";
import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const projectId = "a35691f011761d63c1dd60354147a840"; 

export const config = createConfig({
  chains: [mainnet, polygon, optimism, bscTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "YourApp",
        description: "Your App description",
        url: window.location.origin,
        icons: ["https://yourapp.com/icon.png"], // Replace with real HTTPS URL
      },
      onUri(uri) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          // Directly open MetaMask on mobile
          const deepLink = `https://metamask.app.link/wc?uri=${encodeURIComponent(
            uri
          )}`;
          window.location.href = deepLink;
        }
        // On desktop, let WalletConnect show its QR modal
      },
      showQrModal: true, // Keep this true for desktop
    }),
  ],

  // Define how our app will talk to the blockchain , http is an function provide the base URL to communicate with the chain
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545"),
  },
});