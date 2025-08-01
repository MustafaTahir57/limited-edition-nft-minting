// // chains/bscTestnet.js or directly in your config file
import { defineChain } from "viem";

export const bscTestnet = defineChain({
  id: 97,
  name: "Binance Smart Chain Testnet",
  nativeCurrency: {
    name: "Binance Chain Native Token",
    symbol: "tBNB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    },
    public: {
      http: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    },
  },
  blockExplorers: {
    default: {
      name: "BscScan",
      url: "https://testnet.bscscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11", // universal Multicall3 used in many testnets
      blockCreated: 1n, // Use real block if you want, or just use 1n
    },
  },
});

// import { defineChain } from "viem";

// export const bscMainnet = defineChain({
//   id: 56,
//   name: "Binance Smart Chain Mainnet",
//   nativeCurrency: {
//     name: "Binance Coin",
//     symbol: "BNB",
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ["https://bsc-dataseed.binance.org"],
//     },
//     public: {
//       http: ["https://bsc-dataseed.binance.org"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "BscScan",
//       url: "https://bscscan.com",
//     },
//   },
//   contracts: {
//     multicall3: {
//       address: "0xca11bde05977b3631167028862be2a173976ca11", // Still valid on BSC mainnet
//       blockCreated: 1n, // Optional: use the actual block if known
//     },
//   },
// });
