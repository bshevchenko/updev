import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import type { NextPage } from "next";
import { CopyToClipboard } from "react-copy-to-clipboard";
// import useSWR from "swr";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { ConnectSocialAccounts } from "~~/components/updev/";
import { convertIpfsUrl } from "~~/utils/helpers";

// const fetcher = (...args: [RequestInfo, RequestInit?]) => fetch(...args).then(res => res.json());

const Profile: NextPage = () => {
  const router = useRouter();
  const address = Array.isArray(router.query.address) ? router.query.address[0] : router.query.address || "";
  const [metadata, setMetadata] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // const {
  //   data: bgData,
  //   error,
  //   isValidating,
  // } = useSWR(
  //   address ? `https://buidlguidl-v3.ew.r.appspot.com/builders/0x41f727fA294E50400aC27317832A9F78659476B9` : null,
  //   fetcher,
  // );

  // const isLoading = !bgData && !error && isValidating;
  // console.log("isLoading", isLoading);

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

  return (
    <div className="flex flex-col items-center py-10">
      <div className="max-w-3xl flex flex-col">
        <div className="relative mb-3">
          <div className="w-full h-[200px] bg-base-200 rounded-xl overflow-hidden relative">
            <Image
              alt="cover picture"
              fill
              src={convertIpfsUrl(metadata.LSP3Profile.backgroundImage[1].url)}
              className="object-cover object-center"
            />
          </div>
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-32">
            <div className="rounded-full overflow-hidden w-full h-full border-[8px] border-base-300">
              <Image
                alt="profile picture"
                width={500}
                height={500}
                src={convertIpfsUrl(metadata.LSP3Profile.profileImage[0].url)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 mb-10 w-full">
          <div className="flex flex-col items-center justify-center">
            <div className="px-1.5 py-0.5 rounded-md text-xl text-secondary flex items-center gap-2 mb-3">
              <div className="text-2xl">{address}</div>
              <CopyToClipboard text={address} onCopy={() => setCopied(true)}>
                <button className="">
                  {copied ? (
                    <CheckCircleIcon className="w-6 cursor-pointer" />
                  ) : (
                    <DocumentDuplicateIcon className="w-6 cursor-pointer" />
                  )}
                </button>
              </CopyToClipboard>
            </div>
            <div>
              <h3 className="text-2xl mb-0 font-bold text-center">@{metadata.LSP3Profile.name}</h3>
            </div>
          </div>

          <div className="flex gap-3 items-center justify-between">
            <div className="flex items-center gap-4">
              {metadata.LSP3Profile.links.map((link: { title: string; url: string }, index: number) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={link.title}
                  className="flex items-center gap-1"
                >
                  <div className="text-[#FFFFFFA3] underline mr-2">{link.title}</div>
                  {index < metadata.LSP3Profile.links.length - 1 && <div className="text-[#FFFFFFA3]">{"\u2022"}</div>}
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              {metadata.LSP3Profile.tags.map((tag: string) => (
                <div
                  key={tag}
                  className="text-accent font-semibold bg-base-100 px-2 py-0.5 rounded-md border border-base-200"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div>{metadata.LSP3Profile.description}</div>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-3">Your achievements</h3>
          <div className="flex gap-3">
            <Image width={117} height={117} alt="achievement icon" src="/achievements/up.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/og-updev.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/github.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/buildbox.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/buidlguidl.svg" />
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
