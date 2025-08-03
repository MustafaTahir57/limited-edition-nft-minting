import { defineChain } from "viem";

export const ethMainnet = defineChain({
  id: 1,
  name: "Ethereum Mainnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://eth.llamarpc.com"], // ✅ Free & fast public RPC
    },
    public: {
      http: ["https://eth.llamarpc.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11", // ✅ Multicall3 on Ethereum
      blockCreated: 14353601n,
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
