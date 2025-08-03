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
} from "../utils/useContract";
import logo from "../components/assets/WhatsApp Image 2025-08-01 at 12.19.08 PM.png"
function Mint() {
  const { priceUSDT } = useMintPriceUSDT("1");

  const { approve } = useApproveUSDT(priceUSDT);
  const { priceBNB, refetch: refetchPriceBNB } = useMintPriceBNB();
  const { totalSupply, refetch: refetchTotalSupply } = useTotalSupply();
  const { MaxSupply, refetch: refetchMaxSupply } = useMaxSupply();
const { nfts, refetch } = useFetchUserNFTs();

  // Function to refetch all data on mint success
  const onMintSuccess = () => {
    refetchPriceBNB();
    refetchTotalSupply();
    refetchMaxSupply();
    refetch();
  };
  const { mint, isLoading: isMintingUSDT  } = useMintWithUSDT(onMintSuccess);
  const { mintNFT, isLoading: isMintingBNB  } = useMintWithBNB(onMintSuccess);
  return (
    <>
      <ToastContainer />
      <nav className="navbar">
        <div className="logo"><img width={150} src={logo} alt="" /></div>
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
              <span className="strat">Price: {priceUSDT/ 1e6} USDT</span>
              <br />
              {/* <span className="strat">Remaining: {totalSupply}</span>  */}
            </span>
          </div>
{/* /{MaxSupply} */}
          <button className="mint-button" onClick={() => mintNFT(priceBNB)}  disabled={isMintingBNB}>
        {isMintingBNB ? "Minting..." : "Mint with ETH"}
          </button>
          <button
            className="mint-button"
            style={{ marginTop: "10px" }}
            onClick={async () => {
              await approve(); // approve with priceUSDT
              await mint();
            }}
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
        <p>© 2023 NFT Collection. All rights reserved.</p>
      </footer>
    </>
  );
}

export default Mint;
