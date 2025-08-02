import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";

import { readContract } from "wagmi/actions";
import { parseUnits } from "viem";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { NFTAddress, NFTABI } from "../contracts/NFT";
import { USDTAddress, USDT_ABI } from "../contracts/Usdt";

// Fetch User NFTs
export const useFetchUserNFTs = () => {
  const { address, chain } = useAccount();
  const chainId = chain?.id;
  const publicClient = usePublicClient(); // ✅ get client from wagmi

  const [nfts, setNfts] = useState([]);

  const { data: tokenIds, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "walletOfOwner",
    args: [address],
    chainId: chainId,
    enabled: !!address && !!chainId,
    watch: true,
  });

  useEffect(() => {
    const fetchMetadata = async () => {
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
              console.warn("Error for tokenId", tokenId, e);
              return null;
            }
          })
        );

        const validNfts = nftList.filter((item) => item !== null);
        setNfts(validNfts);
        console.log("Fetched NFTs:", validNfts);
      } catch (err) {
        console.error("Error fetching metadata", err);
        toast.error("Error fetching NFT metadata");
      }
    };

    fetchMetadata();
  }, [tokenIds, address, publicClient]);

  return { nfts, refetch };
};

// Price in BNB
export const useMintPriceBNB = (amount = "1") => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getMintPriceETH",
    args: [amount],
    watch: true, // auto update on chain changes
  });

  return {
    priceBNB: data ? Number(data) / 1e18 : 0,
    isLoading: isPending,
    refetch,
  };
};

// Price in USDT
export const useMintPriceUSDT = (amount = "1") => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getMintPriceUSDT",
    args: [amount],
    watch: true,
  });

  return {
    priceUSDT: data ? Number(data) / 1e18 : 0,
    isLoading: isPending,
    refetch,
  };
};
// hooks/useCurrentDrop.js
export const useCurrentDrop = () => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getCurrentDrop",
  });

  console.log("useCurrentDrop", data);

  return {
    drop: data,
    isLoading: isPending,
    refetch,
  };
};

// hooks/useDropRemaining.js
export const useDropRemaining = (drop) => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getDropRemaining",
    args: [drop],
    watch: true,
  });

  console.log("useDropRemaining", data);

  return {
    remaining: data,
    isLoading: isPending,
    refetch,
  };
};

// Total Supply
export const useTotalSupply = () => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "totalSupply",
    watch: true,
  });

  return {
    totalSupply: data ? Number(data) : 0,
    isLoading: isPending,
    refetch,
  };
};
export const useMaxSupply = () => {
  const { data, isPending, refetch } = useReadContract({
    address: NFTAddress,
    abi: NFTABI,
    functionName: "getMaxSupply",
    watch: true,
  });

  return {
   MaxSupply: data ? Number(data) : 0,
    isLoading: isPending,
    refetch,
  };
};

// Approve USDT hook with toast
export const useApproveUSDT = (amount = "10", onSuccessRefetch = () => {}) => {
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState(null);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("USDT approved successfully!");
      onSuccessRefetch();
    }
  }, [isSuccess]);

  const approve = async () => {
    try {
      const txHash = await writeContractAsync({
        address: USDTAddress,
        abi: USDT_ABI,
        functionName: "approve",
        args: [NFTAddress, parseUnits(amount.toString(), 6)],
      });
      setHash(txHash);
      toast.info("Approve transaction sent. Waiting for confirmation...");
    } catch (err) {
      console.error("USDT Approve Error:", err);
      toast.error("Approve failed: " + (err?.message || err));
    }
  };

  return { approve, isLoading, isSuccess };
};

// Mint with BNB hook with toast and auto update
export const useMintWithBNB = (remaining, onSuccessRefetch = () => {}) => {
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState(null);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("NFT Minted successfully!");
      onSuccessRefetch();
    }
  }, [isSuccess]);

  const mintNFT = async (priceBNB) => {
    if (!remaining || remaining === 0) {
      toast.warn("Drop sold out! Please wait for the next drop.");
      return;
    }

    try {
      const txHash = await writeContractAsync({
        address: NFTAddress,
        abi: NFTABI,
        functionName: "buyNFTWithETH",
        args: ["1"],
        value: parseUnits(priceBNB.toString(), 18),
      });
      setHash(txHash);
      toast.info("Mint transaction sent. Waiting for confirmation...");
    } catch (err) {
      console.error("BNB Mint Error:", err);
      toast.error("Mint failed: " + (err?.message || err));
    }
  };

  return { mintNFT, isLoading, isSuccess };
};

// Mint with USDT hook with toast
export const useMintWithUSDT = (remaining, onSuccessRefetch = () => {}) => {
  const { writeContractAsync } = useWriteContract();
  const [hash, setHash] = useState(null);
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("NFT Minted successfully!");
      onSuccessRefetch();
    }
  }, [isSuccess]);

  const mint = async () => {
    if (!remaining || remaining === 0) {
      toast.warn("Drop sold out! Please wait for the next drop.");
      return;
    }

    try {
      const txHash = await writeContractAsync({
        address: NFTAddress,
        abi: NFTABI,
        functionName: "buyNFTWithUSDT",
        args: ["97"],
      });
      setHash(txHash);
      toast.info("Mint transaction sent. Waiting for confirmation...");
    } catch (err) {
      console.error("USDT Mint Error:", err);
      toast.error("Mint failed: " + (err?.message || err));
    }
  };

  return { mint, isLoading, isSuccess };
};
