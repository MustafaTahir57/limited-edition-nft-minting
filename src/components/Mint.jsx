import React from "react";
import nftss from "./assets/nft.jpg";
import WalletConnect from "./walletConnect";
import { ToastContainer } from "react-toastify";
import {
  useMintPriceBNB,
  useMintPriceUSDT,
  useTotalSupply,
  useMaxSupply,
  useFetchUserNFTs,
  useMintWithBNB,
  useApproveUSDT,
  useMintWithUSDT,
  useUSDTAllowance,
} from "../utils/useContract";
import logo from "../components/assets/WhatsApp Image 2025-08-01 at 12.19.08 PM.png";
import { useAccount } from "wagmi";
import { NFTAddress } from "../contracts/NFT";
function Mint() {
  const { priceUSDT } = useMintPriceUSDT("1");

  const { approve } = useApproveUSDT(priceUSDT);
  const { priceBNB, refetch: refetchPriceBNB } = useMintPriceBNB();
  const { totalSupply, refetch: refetchTotalSupply } = useTotalSupply();
  const { MaxSupply, refetch: refetchMaxSupply } = useMaxSupply();
  const { nfts, refetch } = useFetchUserNFTs();

  const { address } = useAccount();
  const { allowance, isLoading: allowanceLoading } = useUSDTAllowance(
    address,
    NFTAddress
  );

  const handleMintWithUSDT = async () => {
    // USDT usually has 6 decimals
    const price = Number(priceUSDT) / 1e18;

    // Convert allowance BigInt -> readable number
    const allowanceReadable = Number(allowance) / 1e18; // if token has 18 decimals
    // const allowanceReadable = Number(allowance) / 1e6; // if token has 6 decimals

    console.log("Allowance:", allowanceReadable , price);

    if (allowanceReadable <= price ) {
      console.log("Condition Approval True")
      await approve();
    }

    await mint();
  };

  // Function to refetch all data on mint success
  const onMintSuccess = () => {
    refetchPriceBNB();
    refetchTotalSupply();
    refetchMaxSupply();
    refetch();
  };
  const { mint, isLoading: isMintingUSDT } = useMintWithUSDT(onMintSuccess);
  const { mintNFT, isLoading: isMintingBNB } = useMintWithBNB(onMintSuccess);
  return (
    <>
      <ToastContainer />
      <nav className="navbar">
        <div className="logo">
          <img width={150} src={logo} alt="" />
        </div>
        <WalletConnect />
      </nav>

      <main className="main-content">
        <div className="mint-card">
          <h2>Mint Your Exclusive NFT</h2>
          <img className="nft-preview" src={nftss} alt="Preview NFT" />
          <p className="description">Time to protect your wallet!</p>

          <div className="mint-info">
            <span>
              <span className="strat">Price: {priceBNB} ETH</span>
              <br />
              <span className="strat">Price: {priceUSDT / 1e18} USDT</span>
              <br />
              {/* <span className="strat">Remaining: {totalSupply}</span>  */}
            </span>
          </div>
          {/* /{MaxSupply} */}
          <button
            className="mint-button"
            onClick={() => mintNFT(priceBNB)}
            disabled={isMintingBNB}
          >
            {isMintingBNB ? "Minting..." : "Mint with ETH"}
          </button>
          <button
            className="mint-button"
            style={{ marginTop: "10px" }}
            onClick={handleMintWithUSDT}
            disabled={isMintingUSDT}
          >
            {isMintingUSDT ? "Minting..." : "Mint with USDT"}
          </button>
        </div>

        <div className="mint-card2" style={{ marginTop: "30px" }}>
          <h2>Your NFTs</h2>
          <div className="nft-gallery">
            {nfts.map((nft) => (
              <div key={nft.tokenId} className="nft-item">
                <img
                  src={nft.image || nftss}
                  alt="NFT Preview"
                  className="nft-img"
                />
                <p>
                  <strong>Name:</strong> {nft.name}
                </p>
                <p>
                  <strong>Token ID:</strong> {nft.tokenId}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: "20px" }}>
        <p>© 2025 NFT Collection. All rights reserved.</p>
      </footer>
    </>
  );
}

export default Mint;
