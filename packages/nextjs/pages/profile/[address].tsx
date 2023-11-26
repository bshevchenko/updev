import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import type { NextPage } from "next";
import { ConnectSocialAccounts } from "~~/components/updev/";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";
import { convertIpfsUrl } from "~~/utils/helpers";

const Profile: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { universalProfileData } = useContext(UniversalProfileContext);
  const [metadata, setMetadata] = useState<any>(null);

  console.log("address", address);
  console.log("universalProfileData", universalProfileData);

  useEffect(() => {
    async function fetchData() {
      if (address) {
        const lsp3ProfileSchemaModule = await import("@erc725/erc725.js/schemas/LSP3ProfileMetadata.json");
        const lsp3ProfileSchema = lsp3ProfileSchemaModule.default;
        const erc725js = new ERC725(lsp3ProfileSchema as ERC725JSONSchema[], address, "https://rpc.lukso.gateway.fm", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        try {
          const profileMetaData = await erc725js.fetchData("LSP3Profile");
          setMetadata(profileMetaData.value);
        } catch (error) {
          console.error("Error fetching ERC725 data:", error);
        }
      }
    }
    fetchData();
  }, [address]);

  if (!metadata)
    return (
      <div className="flex justify-center grow">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  console.log("metadata", metadata);

  return (
    <div className="flex flex-col items-center py-10">
      <div className="max-w-3xl flex flex-col">
        <div className="relative mb-5">
          <div className="w-full h-[200px] bg-base-200 rounded-xl overflow-hidden relative">
            <Image
              alt="cover picture"
              fill
              src={convertIpfsUrl(metadata.LSP3Profile.backgroundImage[1].url)}
              className="object-cover object-center"
            />
          </div>
          <div className="absolute -bottom-16 start-5  w-32 h-32">
            <div className="rounded-full overflow-hidden w-full h-full">
              <Image
                alt="profile picture"
                width={128}
                height={128}
                src={convertIpfsUrl(metadata.LSP3Profile.profileImage[0].url)}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 mt-16 md:mt-0 md:grid-cols-5 mb-10">
          <div className="col-span-1"></div>
          <div className="flex flex-col gap-5 col-span-4">
            <div className="flex gap-3">
              <h3 className="text-2xl mb-0 font-bold">@{metadata.LSP3Profile.name}</h3>
              <div className="] bg-base-100 px-1.5 py-0.5 rounded-md border border-base-200">
                🆙 <span className="text-[#FFFFFF5C]">{address?.slice(0, 5) + "..." + address?.slice(-4)}</span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-4">
                {metadata.LSP3Profile.links.map((link: { title: string; url: string }) => (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={link.title}
                    className="flex items-center gap-1"
                  >
                    <div>
                      <Image width={12} height={12} alt="link icon" src="/link.svg" />
                    </div>
                    <div className="text-[#FFFFFFA3] underline">{link.title}</div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-base-content">Bio</div>
              <div>{metadata.LSP3Profile.description}</div>
            </div>
            <div className="flex gap-1">
              {metadata.LSP3Profile.tags.map((tag: string) => (
                <div key={tag} className="text-accent font-semibold bg-base-100 px-1 rounded-md border border-base-200">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-3">Your achievements</h3>
          <div className="flex gap-3">
            <Image width={117} height={117} alt="achievement icon" src="/achievements/universal-profile.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/github.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/linkedin.svg" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-3">Connect your upDev to earn achievements</h3>
          <ConnectSocialAccounts />
        </div>
      </div>
    </div>
  );
};

export default Profile;
