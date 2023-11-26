import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";
import { convertIpfsUrl } from "~~/utils/helpers";

export function DeployUniversalProfileStep({ setCurrentStep }: { setCurrentStep: any }) {
  const { universalProfileData } = useContext(UniversalProfileContext);
  const [metadata, setMetadata] = useState<any>(null);

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
            <div className="text-xl">{metadata.LSP3Profile.name}</div>
          </div>
        )}
        <div className="text-center mt-10">
          TODO hints: we need UP on Mumbai for Chainlink Functions. LSP23 same address, LSP24 references.
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => setCurrentStep(3)} className="btn btn-primary py-0 text-md">
            Deploy Universal Profile
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
        className="btn border-white hover:border-accent fixed bottom-10 right-44 w-[128px]"
        onClick={() => {
          setCurrentStep(1);
          // TODO UPE logout
        }}
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
