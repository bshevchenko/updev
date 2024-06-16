import { useEffect, useState } from "react";
import Image from "next/image";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { convertIpfsUrl } from "~~/utils/helpers";

export function ProfileCard({ upAddress }: { upAddress: string }) {
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (upAddress) {
        const lsp3ProfileSchemaModule = await import("@erc725/erc725.js/schemas/LSP3ProfileMetadata.json");
        const lsp3ProfileSchema = lsp3ProfileSchemaModule.default;
        const erc725js = new ERC725(
          lsp3ProfileSchema as ERC725JSONSchema[],
          upAddress,
          "https://rpc.testnet.lukso.network",
          {
            ipfsGateway: "https://api.universalprofile.cloud/ipfs",
          },
        );
        try {
          const profileMetaData = await erc725js.fetchData("LSP3Profile");
          setMetadata(profileMetaData.value);
        } catch (error) {
          console.error("Error fetching ERC725 data:", error);
        }
      }
    }
    fetchData();
  }, [upAddress]);

  if (!metadata) return <div className="skeleton w-32 h-32 bg-base-200 w-full h-80 rounded-3xl animate-pulse"></div>;

  // const backgroundImage = ""; // TODO metadata.LSP3Profile.backgroundImage[1].url;
  const profileImage = metadata.LSP3Profile.profileImage[0].url;

  // const backgroundStyle = {
  //   backgroundImage: `url(${convertIpfsUrl(backgroundImage)})`,
  //   backgroundSize: "cover", // To cover the entire area of the div
  //   backgroundPosition: "center", // To center the background image
  // };

  return (
    <div
      // style={backgroundStyle}
      className="relative bg-base-200 w-full h-80 rounded-3xl flex flex-col justify-end transition duration-300 ease-in-out hover:scale-105 border-base-200 "
    >
      <div className="absolute top-[35%] z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden w-32 h-32 border-[10px] border-base-300"></div>
      <div className="absolute top-[35%] z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden w-32 h-32 border-[10px] border-base-100">
        <Image alt="profile picture" width={1000} height={1000} src={convertIpfsUrl(profileImage)} />
      </div>
      <div className="absolute bottom-0 h-1/2 w-full z-0 bg-base-300 rounded-3xl"></div>

      <div className="h-1/2 z-0 flex flex-col bg-base-100 border border-base-200 justify-center items-center rounded-3xl gap-4 p-6">
        <div className="font-bold">
          @{metadata.LSP3Profile.name}
          <span className="ml-1 text-accent">#{upAddress.slice(2, 6)}</span>
        </div>
        <div className="flex gap-2 whitespace-pre-wrap break-all">{metadata.LSP3Profile.description}</div>
        {/* <div className="flex gap-2 h-[30px]">
          {metadata.LSP3Profile.tags.map((tag: string) => (
            <div
              key={tag}
              className="text-neutral-800 font-semibold bg-accent px-2 py-0.5 rounded-md border border-base-200"
            >
              {tag}
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
