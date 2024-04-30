import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { providers } from "ethers";
import { WalletClient, useWalletClient } from "wagmi";
import axios from "axios";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */ // TODO why?
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(() => (walletClient ? walletClientToSigner(walletClient) : undefined), [walletClient]);
}

export function DeployUniversalProfileStep({ setCurrentStep }: { setCurrentStep: any }) {
  const signer = useEthersSigner();
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: session } = useSession();

  async function handleDeploy() {
    if (!signer) {
      return;
    }
    
    const _session = await axios.get("/api/session");
    if (!_session.data.token) {
      return;
    }
    if (!session || !session.user) {
      return;
    }
    console.log("Sign from", signer._address);
    const signature = await signer.signMessage(_session.data.token);

    setIsDeploying(true);

    try {
      const result = await axios.post("/api/sign-up", {
        token: _session.data.token,
        controller: signer._address,
        signature,
        name: session.user.name, // TODO
        description: "Boris has more than 15 years of full-stack software architecture and development experience at high-tech startups and DeFi, DAO dApps/projects.", 
      });
      console.log('API Result', result.data);
      setIsDeploying(false);
      // setCurrentStep(3); TODO
    } catch (e) {
      console.error("Deploying error", e);
      setIsDeploying(false);
    }
  }

  return (
    <>
      <OnboardProgressIndicator completedSteps={1} />
      <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-96">
        <div className="text-center mt-10">
          <p><b>Hello, {session && session.user && session.user.name}!</b></p>
          Click to create your UP on Lukso & Sepolia.
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => handleDeploy()} className="btn btn-primary py-0 text-md" disabled={isDeploying && false}>
            {isDeploying && false ? (
              "Deploying..."
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </div>
      <button
        className="btn border-white hover:border-accent fixed bottom-10 right-9 w-[128px]"
        onClick={() => {
          signOut();
        }}
        disabled={isDeploying}
      >
        <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
        Back
      </button>
    </>
  );
}
