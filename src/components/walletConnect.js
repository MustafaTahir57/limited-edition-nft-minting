import React, { useEffect, useState } from "react";
import {
  useConnect,
  useAccount,
  useBalance,
  useDisconnect,
  useChainId,
  useSwitchChain
} from "wagmi";
import "./walletConnect.css";
import { walletConnect } from "wagmi/connectors";
import { useConnectorClient } from "wagmi";
import { bscTestnet } from "viem/chains";

const WalletConnect = () => {
  const chainId = useChainId();

  const { connect, connectors } = useConnect();
  const { data: client } = useConnectorClient();
  const { address, isConnected, chain, connector } = useAccount();
  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    address,
    chainId: chain?.id, // ✅ This ensures it refetches on chain switch
    watch: true, // optional: refetch on every block
  });
  const {
    switchChain,
    chains,
    error: switchError,
    isPending: switching,
  } = useSwitchChain();

  const { disconnect } = useDisconnect();

  useEffect(() => {
    const ensureBscTestnet = async () => {
      if (isConnected && chainId !== 97) {
        try {
          console.log("⚠️ Not on BSC Testnet. Switching...");
          await switchChain({ chainId: 97 });
          console.log("✅ Switched to BSC Testnet");
        } catch (err) {
          console.error("❌ Failed to switch network:", err);
        }
      }
    };

    ensureBscTestnet();
  }, [isConnected, chainId]);

  useEffect(() => {
    if (isConnected) {
      console.log("Chain ID", chainId)
      console.log("Balance", balance?.formatted )

    }
  }, [isConnected])


  const [showModal, setshowModal] = useState(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="wallet-container">
      {!isConnected ? (
        <div className="connect-section">
          <button
            className="connect-wallet"
            onClick={() => setshowModal((prev) => !prev)}
          >
            Connect Wallet
          </button>

          {showModal && (
            <div className="wallet-modal">
              {/* MetaMask */}
              <button
                className="wallet-option"
                onClick={() => {
                  const connector = isMobile
                    ? connectors.find((c) => c.id === "metaMaskSDK")
                    : connectors.find((c) => c.id === "metaMaskSDK");

                  if (!connector) {
                    alert("MetaMask not found. Please install it.");
                    return;
                  }

                  connect({ connector });
                }}
              >
                MetaMask
              </button>

              {/* WalletConnect */}
              <button
                className="wallet-option"
                onClick={() => {
                  const connector = connectors.find(
                    (c) => c.id === "walletConnect"
                  );

                  if (!connector) {
                    alert("WalletConnect not available.");
                    return;
                  }

                  connect({ connector });
                }}
              >
                WalletConnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="connect-wallet text-start" onClick={disconnect}>
          <p>
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "No Address"}
            <br />
          </p>

          {isLoading ? (
            <p>Loading balance...</p>
          ) : error ? (
            <p>Error fetching balance</p>
          ) : (
            <p>
              {balance?.formatted} {balance?.symbol}
            </p>
          )}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
