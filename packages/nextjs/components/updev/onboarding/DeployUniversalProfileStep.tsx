import { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { LSPFactory } from "@lukso/lsp-factory.js";
import { providers } from "ethers";
import { WalletClient, useAccount, useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";
import { convertIpfsUrl } from "~~/utils/helpers";

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

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(() => (walletClient ? walletClientToSigner(walletClient) : undefined), [walletClient]);
}

export function DeployUniversalProfileStep({ setCurrentStep }: { setCurrentStep: any }) {
  const { universalProfileData } = useContext(UniversalProfileContext);
  const [metadata, setMetadata] = useState<any>(null);
  const signer = useEthersSigner();
  const account = useAccount();
  const [isDeploying, setIsDeploying] = useState(false);
  const [txCounter, setTxCounter] = useState(0);

  const { data: walletClient } = useWalletClient();
  const { data: upRegistry } = useScaffoldContract({
    contractName: "upRegistry",
    walletClient,
  });

  useEffect(() => {
    if (!universalProfileData.address || universalProfileData.address === "") return;
    async function fetchData() {
      // Dynamically import the JSON schema to satisfy nextjs
      const lsp3ProfileSchemaModule = await import("@erc725/erc725.js/schemas/LSP3ProfileMetadata.json");
      const lsp3ProfileSchema = lsp3ProfileSchemaModule.default;
      const erc725js = new ERC725(
        lsp3ProfileSchema as ERC725JSONSchema[],
        universalProfileData.address,
        "https://rpc.lukso.gateway.fm",
        {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        },
      );
      const profileMetaData = await erc725js.fetchData("LSP3Profile");

      setMetadata(profileMetaData.value);
    }
    fetchData();
  }, [universalProfileData.address]);

  async function handleDeploy() {
    if (!signer) {
      return;
    }
    setIsDeploying(true);
    try {
      const lspFactory = new LSPFactory(signer.provider, signer);

      let _txCounter = 0;

      const response = await lspFactory.UniversalProfile.deploy(
        {
          controllerAddresses: [account.address || ""],
        },
        {
          LSP1UniversalReceiverDelegate: {
            version: "0x2F0fC0864D9C69f1f05f2297dc4c72b24DdE7258",
            deployProxy: false,
          },
          LSP6KeyManager: {
            version: "0xbc3D630F9B1cF39E92715F8463Bd1C2B03B0347C",
            deployProxy: false,
          },
          LSP0ERC725Account: {
            version: "0x8F28d9b46862FC5F5BC5726D2DE4ab5342405Dd8",
            deployProxy: false,
          },
          onDeployEvents: {
            next: deploymentEvent => {
              if (deploymentEvent.status == "COMPLETE") {
                setTxCounter(_txCounter + 1);
                _txCounter++;
              }
              console.log(deploymentEvent);
            },
            error: error => {
              console.error(error);
            },
            complete: contracts => {
              console.log("Universal Profile deployment completed");
              console.log(contracts);
            },
          },
        },
      );

      // const response = { // TODO
      //   LSP0ERC725Account: { address: '0x7369A0c52480982Bd1DE668B873cA14aD87610Fd' },
      //   LSP6KeyManager: { address: '0x467D8f4B135f8075c8Ad19B4AA02333C7eEcCEfb' }
      // }

      const tx = await upRegistry?.write.setUp([
        response.LSP0ERC725Account.address,
        response.LSP6KeyManager.address,
        universalProfileData.address,
      ]);

      // TODO add LSP24 reference
      // TODO add LSP24 reference via UPE

      console.log("LSPFactoryResponse", response);
      console.log("setUp tx", tx);

      setIsDeploying(false);
      setCurrentStep(3);
    } catch (e) {
      console.error("Deploying error", e);
      setIsDeploying(false);
    }
  }

  return (
    <>
      <OnboardProgressIndicator completedSteps={1} />
      <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-96">
        {!metadata ? (
          <div className="grow flex flex-col justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="flex justify-center items-center gap-4">
            <div className="rounded-full overflow-hidden">
              <Image
                alt="upDev logo"
                width={88}
                height={88}
                src={convertIpfsUrl(metadata.LSP3Profile.profileImage[0].url)}
              />
            </div>
            <div className="text-xl">
              Hey, <b>@{metadata.LSP3Profile.name}</b>
            </div>
          </div>
        )}

        <div className="text-center mt-10">Click to deploy your UP on Polygon Mumbai in order to create account.</div>
        <div className="mt-10 text-center">
          <button onClick={() => handleDeploy()} className="btn btn-primary py-0 text-md" disabled={isDeploying}>
            {isDeploying ? (
              <>
                <span className="loading loading-spinner loading-md"></span> Deploying{" "}
                {Math.floor((txCounter / 9) * 100)}%, {txCounter} of 9...
              </>
            ) : (
              "Deploy Universal Profile"
            )}
          </button>
        </div>
        <div className="flex flex-col items-center mt-5">
          <a
            href="https://mumbaifaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            Mumbai Faucet
          </a>
        </div>
      </div>
      <button
        className="btn border-white hover:border-accent fixed bottom-10 right-9 w-[128px]"
        onClick={() => {
          setCurrentStep(1);
        }}
        disabled={isDeploying}
      >
        <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
        Back
      </button>

      {/* <button className="btn btn-primary fixed bottom-10 right-9 w-[128px]" onClick={() => setCurrentStep(3)}>
        Next
        <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
      </button> */}
    </>
  );
}
