import { useEffect, useState } from "react";
import { useContext } from "react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";
import { convertIpfsUrl } from "~~/utils/helpers";

export function DeployUniversalProfileStep({
  setCurrentStep,
  setUpConnected,
}: {
  setCurrentStep: any;
  setUpConnected: any;
}) {
  const { universalProfileData } = useContext(UniversalProfileContext);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      // Dynamically import the JSON schema
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
      if (profileMetaData.value) {
        setMetadata(profileMetaData.value);
      }
    }
    fetchData();
  }, [universalProfileData.address]);

  if (!metadata) return <span className="loading loading-spinner loading-lg"></span>;

  const { LSP3Profile } = metadata;
  const profileImageUrl = convertIpfsUrl(LSP3Profile.profileImage[0].url);

  console.log("profileImageUrl", profileImageUrl);

  return (
    <>
      <OnboardProgressIndicator completedSteps={1} />
      <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-[336px]">
        <div className="flex justify-center items-center gap-4">
          <div className="rounded-full overflow-hidden">
            <Image alt="upDev logo" width={100} height={100} src={profileImageUrl} />
          </div>
          <div className="text-xl">{LSP3Profile.name}</div>
        </div>

        <div className="text-center">
          <br />
          <br />
          TODO hints: we need UP on Mumbai Testnet to access Chainlink Functions, LSP23 same address, LSP24 references
          <br />
          <br />
          TODO Deploy Universal Profile (LSP23) to Mumbai Testnet if not already deployed
          <br />
          <br />
          TODO LSP24 references
        </div>
        <div className="flex flex-col items-center mt-5">
          <a href="https://mumbaifaucet.com/" target="_blank" rel="noopener noreferrer" className="btn btn-accent">
            Mumbai Faucet
          </a>
        </div>
      </div>
      <button
        className="btn border-white hover:border-accent fixed bottom-10 right-44 w-[128px]"
        onClick={() => {
          setUpConnected(false);
          setCurrentStep(1);
        }}
      >
        <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
        Back
      </button>

      <button className="btn btn-primary fixed bottom-10 right-9 w-[128px]" onClick={() => setCurrentStep(3)}>
        Next
        <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
      </button>
    </>
  );
}
