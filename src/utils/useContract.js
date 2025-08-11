// 🔁 hooks/nftHooks.js

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useConfig,
} from "wagmi";
import { useBalance } from "wagmi";
import { estimateGas } from "wagmi/actions";



import { parseUnits } from "viem";
import { useEffect, useState, useCallback } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { NFTAddress, NFTABI } from "../contracts/NFT";
import { USDTAddress, USDT_ABI } from "../contracts/Usdt";

// ✅ Fetch NFTs and metadata
export const useFetchUserNFTs = () => {
  const { address, chain } = useAccount();
  const chainId = chain?.id;
  const publicClient = usePublicClient();
  const [nfts, setNfts] = useState([]);

  const { data: tokenIds, refetch: refetchTokenIds } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "walletOfOwner",
    args: [address],
    chainId,
    enabled: !!address && !!chainId,
    watch: true,
  });

  const fetchMetadata = useCallback(async () => {
    if (!tokenIds || !address || !publicClient) return;

    try {
      const nftList = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await publicClient.readContract({
              address: NFTAddress,
              abi: NFTABI,
              functionName: "tokenURI",
              args: [tokenId],
            });

            const fixedURI = tokenURI.startsWith("ipfs://")
              ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
              : tokenURI;

            const res = await fetch(fixedURI);
            const metadata = await res.json();
            return { tokenId, ...metadata };
          } catch (e) {
            console.warn("Error fetching tokenId", tokenId, e);
            return null;
          }
        })
      );

      const validNfts = nftList.filter((item) => item !== null);
      setNfts(validNfts);
      console.log("Fetched NFTs:", validNfts);
    } catch (err) {
      console.error("Metadata Fetch Error:", err);
      toast.error("❌ Error fetching NFT metadata");
    }
  }, [tokenIds, address, publicClient]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return { nfts, refetch: fetchMetadata, refetchTokenIds };
};

// ✅ Mint price in BNB
export const useMintPriceBNB = (amount = "1") => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getMintPriceETH",
    args: [amount],
    watch: true,
  });

  return {
    priceBNB: data ? Number(data) / 1e18 : 0,
    isLoading: isPending,
    refetch,
  };
};

// ✅ Mint price in USDT
export const useMintPriceUSDT = (amount = "1") => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getMintPriceUSDT",
    args: [amount],
    watch: true,
  });

  return {
    priceUSDT: data ? Number(data) : 0,
    isLoading: isPending,
    refetch,
  };
};

// ✅ Current Drop
export const useCurrentDrop = () => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getCurrentDrop",
  });

  return { drop: data, isLoading: isPending, refetch };
};

// ✅ Drop Remaining
export const useDropRemaining = (drop) => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getDropRemaining",
    args: [drop],
    watch: true,
  });

  return { remaining: data, isLoading: isPending, refetch };
};

// ✅ Total Supply
export const useTotalSupply = () => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "totalSupply",
    watch: true,
  });

  return { totalSupply: data ? Number(data) : 0, isLoading: isPending, refetch };
};

// ✅ Max Supply
export const useMaxSupply = () => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getMaxSupply",
    watch: true,
  });

  return { MaxSupply: data ? Number(data) : 0, isLoading: isPending, refetch };
};

export const useUSDTAllowance = (owner, spender) => {
  const { data, isPending, refetch } = useReadContract({
    address: USDTAddress,
    abi: USDT_ABI,
    functionName: "allowance",
    args: [owner, spender],
    watch: true, // keep it live
  });

  console.log("Data", data)

  return { allowance: data ?? 0n, isLoading: isPending, refetch };
};


export const useApproveUSDT = (customAmount, onSuccessRefetch = () => { }) => {
  const { priceUSDT } = useMintPriceUSDT("1");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState(null);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: usdtBalanceRaw } = useReadContract({
    address: USDTAddress,
    abi: USDT_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("✅ USDT approved!");
      onSuccessRefetch();
    }
  }, [isSuccess]);

  const approve = async () => {
    let amount;

    // Check balance
    if (!usdtBalanceRaw || usdtBalanceRaw < priceUSDT) {
      toast.error("❌ Insufficient USDT balance!");
      return;
    }
    try {
      const txHash = await writeContractAsync({
        address: USDTAddress,
        abi: USDT_ABI,
        functionName: "approve",
        args: [NFTAddress, priceUSDT],
      });
      setHash(txHash);
      toast.info("⏳ Approving USDT...");
    }
    catch (err) {
      // Check if it's a user rejection
      if (err.name === "UserRejectedRequestError" || err?.cause?.name === "UserRejectedRequestError") {
        toast.error("❌ Approval rejected by user");
      } else {
        toast.error("❌ Transaction Failed")
      }
    }
  };

  return { approve, isLoading, isSuccess };
};
// ✅ Mint with BNB

export const useMintWithBNB = (remaining, onSuccessRefetch = () => { }) => {
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isLoading: isConfirmed, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { address } = useAccount();
  const { data: bnbBalance } = useBalance({ address });
  const config = useConfig()

  useEffect(() => {
    if (isSuccess) {
      toast.success("🎉 NFT Minted with BNB!");
      onSuccessRefetch();
      setIsProcessing(false);
    }
  }, [isSuccess]);

  const mintNFT = async (priceBNB) => {

    if (!remaining || remaining === 0) {
      toast.warn("Drop sold out!");
      return;
    }

    const priceInWei = parseUnits(priceBNB.toString(), 18);

    if (!bnbBalance || bnbBalance.value < priceInWei) {
      toast.error("Insufficient balance!");
      return;
    }

    try {
      setIsProcessing(true);
      const gasEstimate = await estimateGas(config, {
        account: address,
        address: NFTAddress,
        abi: NFTABI,
        functionName: "buyNFTWithETH",
        args: ["1"], // You can replace with dynamic count
        value: priceInWei,
      });

      const minGas = 300000n;
      const bufferedGas = (gasEstimate * 150n) / 100n;
      const finalGas = bufferedGas > minGas ? bufferedGas : minGas;


      const txHash = await writeContractAsync({
        address: NFTAddress,
        abi: NFTABI,
        functionName: "buyNFTWithETH",
        args: ["1"],
        value: priceInWei,
        gas: finalGas,
      });
      setHash(txHash);
      toast.info("⏳ Minting NFT...");
    } catch (err) {
      setIsProcessing(false);
      // console.error("Mint Error:", err);

      // Check if it's a user rejection
      if (err.name === "UserRejectedRequestError" || err?.cause?.name === "UserRejectedRequestError") {
        toast.error("❌ Transaction rejected by user");
      } else {
        toast.error("❌ Mint failed: " + (err?.shortMessage || err?.message || "Unknown error"));
      }
    }
  };

  return { mintNFT, isLoading: isProcessing || isConfirmed, isSuccess };
};

// ✅ Mint with USDT
export const useMintWithUSDT = (remaining, onSuccessRefetch = () => { }, usdtAddress, priceUSDT) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isLoading: isConfirmed, isSuccess } = useWaitForTransactionReceipt({ hash });

  const config = useConfig()

  const { data: usdtBalanceRaw } = useReadContract({
    address: usdtAddress,
    abi: USDT_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("🎉 NFT Minted with USDT!");
      onSuccessRefetch();
      setIsProcessing(false);
    }
  }, [isSuccess]);

  const mint = async () => {
    if (!remaining || remaining === 0) {
      toast.warn("Drop sold out!");
      return;
    }

    try {
      setIsProcessing(true);
      const gasEstimate = await estimateGas(config, {
        account: address,
        address: NFTAddress,
        abi: NFTABI,
        functionName: "buyNFTWithETH",
        args: ["1"], // You can replace with dynamic count

      });

      const minGas = 300000n;
      const bufferedGas = (gasEstimate * 150n) / 100n;
      const finalGas = bufferedGas > minGas ? bufferedGas : minGas;

      console.log("Final gas", finalGas)

      const txHash = await writeContractAsync({
        address: NFTAddress,
        abi: NFTABI,
        functionName: "buyNFTWithUSDT",
        args: ["1"],
        gas: finalGas
      });
      setHash(txHash);
      toast.info("⏳ Minting NFT...");
    } catch (err) {
      setIsProcessing(false);
      // console.error("Mint Error:", err);

      // Check if it's a user rejection
      if (err.name === "UserRejectedRequestError" || err?.cause?.name === "UserRejectedRequestError") {
        toast.error("❌ Transaction rejected by user");
      } else {
        toast.error("❌ Mint failed: " + (err?.shortMessage || err?.message || "Unknown error"));
      }
    }
  };

  return { mint, isLoading: isProcessing || isConfirmed, isSuccess };
};


