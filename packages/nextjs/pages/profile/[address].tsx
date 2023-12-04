import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { hexToString, toHex } from "viem";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { ExclamationTriangleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import lspSchemas from "~~/LSP3ProfileMetadata.json";
import { ConnectSocialAccounts } from "~~/components/updev/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import upRegistryProfile from "~~/types/Profile";
import { convertIpfsUrl } from "~~/utils/helpers";

// TODO change from ethers to viem?

interface Accounts {
  [key: string]: string;
}

const LSP24_SCHEMA_NAME = "LSP24MultichainAddressResolutionPolygon";

const Profile: NextPage = () => {
  const router = useRouter();
  const account = useAccount();
  const address = Array.isArray(router.query.address) ? router.query.address[0] : router.query.address || "";
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accounts, setAccounts] = useState<Accounts>({});
  const [metadata, setMetadata] = useState<any>(null);

  const { data: profile } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [address],
  });
  const upLukso: string | undefined = profile && profile[2];

  const { data: _myProfile } = useScaffoldContractRead({
    contractName: "upRegistry", // @ts-ignore
    functionName: "upByEOA",
    args: [account.address],
  }); // @ts-ignore
  const myProfile: upRegistryProfile | undefined = _myProfile;

  console.log("myProfile", myProfile);
  const isMyProfile = myProfile && address == myProfile.up;

  const { data: tokenIdsOf } = useScaffoldContractRead({
    contractName: "upDevAccountOwnership",
    functionName: "tokenIdsOf",
    args: [address],
  });

  const { data: tokensData } = useScaffoldContractRead({
    contractName: "upDevAccountOwnership",
    functionName: "getDataBatch",
    args: [tokenIdsOf],
  });

  const { data: upDevUsername } = useContractRead({
    address: myProfile?.up,
    abi: UniversalProfileContract.abi,
    functionName: "getData",
    args: [toHex("username", { size: 32 })],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const erc725js = new ERC725(lspSchemas as ERC725JSONSchema[], upLukso, "https://rpc.lukso.gateway.fm", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        const profileMetaData = await erc725js.fetchData("LSP3Profile");

        // Get LSP24 reference from Lukso Mainnet UP to Mumbai (chain id = 0x13881 = 80001) UP
        // TODO use proper LSP24 name once it is officialy released (once schema is available on erc725.js)
        const lsp24 = await erc725js.fetchData(LSP24_SCHEMA_NAME);
        if (lsp24.value !== address) {
          setIsNotVerified(true);
        }

        setMetadata(profileMetaData.value);
      } catch (error) {
        console.error("Error fetching ERC725 data:", error);
      }
    }
    if (upLukso) {
      console.log("Fetching Lukso profile...");
      fetchData();
    }
  }, [upLukso, address, setIsNotVerified]);

  useEffect(() => {
    if (!tokensData) {
      return;
    }
    console.log("tokensData", tokensData);
    tokensData.forEach(d => {
      const [source, id] = ethers.utils.defaultAbiCoder.decode(["string", "string"], d);
      accounts[source] = id;
      setAccounts(accounts);
    });
  }, [tokensData, accounts]);

  const handleVerify = async () => {
    if (!window.lukso) {
      alert("Enable Universal Profile browser extension.");
    } else {
      if (!upLukso) {
        return;
      }
      setIsVerifying(true);
      const accounts = await window.lukso.request({ method: "eth_requestAccounts" });
      if (accounts[0] !== upLukso) {
        alert("Invalid profile. Please select profile that you used for your sign-up on upDev.");
        setIsVerifying(false);
        return;
      } else {
        const web3Provider = new ethers.providers.Web3Provider(window.lukso);
        const contract = new ethers.Contract(upLukso, UniversalProfileContract.abi, web3Provider.getSigner());
        try {
          const schema = lspSchemas.find(s => s.name === LSP24_SCHEMA_NAME);
          if (!schema) {
            console.error("Verification error: LSP24 schema not found");
            return;
          }
          const tx = await contract.setData(schema.key, address);
          await tx.wait();
          setIsNotVerified(false);
        } catch (e) {
          console.error(e);
        }
        setIsVerifying(false);
      }
    }
  };

  if (!metadata || !myProfile) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col gap-5 w-[48rem]">
          <div className="skeleton w-full h-[200px] bg-base-200 w-full rounded-3xl animate-pulse"></div>
          <div className="skeleton w-1/2 h-5 bg-base-200 rounded-3xl animate-pulse"></div>
          <div className="skeleton w-1/2 h-5 bg-base-200 rounded-3xl animate-pulse"></div>
          <div className="skeleton w-full h-5 bg-base-200 rounded-3xl animate-pulse"></div>
          <div className="skeleton w-full h-5 bg-base-200 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-10">
      <div className="max-w-3xl flex flex-col" style={{ minWidth: "48rem" }}>
        {isNotVerified && (
          <div className="border border-[#e36969] rounded-lg p-4 mb-3">
            <div className="text-[#e36969] flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6" />
              This account is not yet verified on Lukso Mainnet.&nbsp;
              {isMyProfile &&
                (isVerifying ? (
                  <>Veryfying...</>
                ) : (
                  <a href="#" onClick={() => handleVerify()} className="underline">
                    Verify
                  </a>
                ))}
            </div>
          </div>
        )}

        <AccountDetails
          metadata={metadata}
          upDevUsername={upDevUsername}
          myProfile={myProfile}
          isMyProfile={isMyProfile}
          isNotVerified={isNotVerified}
          accounts={accounts}
        />

        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-3">Achievements</h3>
          <div className="flex gap-3">
            <div className="tooltip tooltip-primary" data-tip="Universal Profile Owner">
              <Image width={117} height={117} alt="achievement icon" src="/achievements/up.svg" />
            </div>
            <div className="tooltip tooltip-primary" data-tip="upDev Early Adopter">
              <Image width={117} height={117} alt="achievement icon" src="/achievements/og-updev.svg" />
            </div>
            {accounts["github"] && (
              <div className="tooltip tooltip-primary" data-tip="Verified GitHub Account">
                <Image width={117} height={117} alt="achievement icon" src="/achievements/github.svg" />
              </div>
            )}
            {accounts["buidlguidl"] && (
              <div className="tooltip tooltip-primary" data-tip="Verified BuidlGuidl Account">
                <Image width={117} height={117} alt="achievement icon" src="/achievements/buidlguidl.svg" />
              </div>
            )}
            {/* <Image width={117} height={117} alt="achievement icon" src="/achievements/buildbox.svg" /> */}
          </div>
        </div>
        {isMyProfile && (
          <div>
            <h3 className="text-2xl font-bold mb-3">Connect accounts</h3>
            <ConnectSocialAccounts />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

function AccountDetails({
  myProfile,
  metadata,
  upDevUsername,
  isMyProfile,
  isNotVerified,
  accounts,
}: {
  myProfile: upRegistryProfile;
  metadata: any;
  upDevUsername: any;
  isMyProfile: boolean | undefined;
  isNotVerified: boolean;
  accounts: Accounts;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    if (upDevUsername && upDevUsername !== "0x") {
      setUsernameInput(hexToString(upDevUsername as `0x${string}`));
    } else {
      setUsernameInput(metadata.LSP3Profile.name);
    }
  }, [upDevUsername, metadata.LSP3Profile.name]);

  const { write: updateUpDevUsername, isLoading } = useContractWrite({
    address: myProfile?.up,
    abi: UniversalProfileContract.abi,
    functionName: "setData",
    args: [toHex("username", { size: 32 }), toHex(usernameInput)],
  });

  return (
    <section>
      <div className="relative mb-3">
        <div className="w-full h-[200px] bg-base-200 rounded-xl overflow-hidden relative">
          <Image
            alt="cover picture"
            fill
            src={convertIpfsUrl(metadata.LSP3Profile.backgroundImage[1].url)}
            className="object-cover object-center"
          />
        </div>
        <div className="absolute -bottom-16 left-5 w-32">
          <div className="rounded-full overflow-hidden w-full h-full border-[4px] border-base-300">
            <Image
              alt="profile picture"
              width={500}
              height={500}
              src={convertIpfsUrl(metadata.LSP3Profile.profileImage[0].url)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-10 w-full pl-40">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              className="text-primary-content py-1 px-2 rounded-md"
            />
          ) : isLoading ? (
            <div>Updating username...</div>
          ) : (
            <h3 className="text-2xl mb-0 font-bold">
              {upDevUsername === "0x" ? metadata.LSP3Profile.name : hexToString(upDevUsername as `0x${string}`)}
            </h3>
          )}

          {isEditing ? (
            <>
              <button
                className="bg-accent py-1 px-3 rounded-md w-20"
                onClick={() => {
                  updateUpDevUsername();
                  setIsEditing(false);
                }}
              >
                save
              </button>
              <button
                className="bg-secondary py-1 px-3 rounded-md w-20"
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                cancel
              </button>
            </>
          ) : isMyProfile ? (
            <PencilSquareIcon className="w-6 h-6 text-secondary cursor-pointer" onClick={() => setIsEditing(true)} />
          ) : null}
        </div>
        <div className="flex gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              <div className="text-[#FFFFFFA3]">
                {!isNotVerified && myProfile.upLukso ? (
                  <a
                    href={`https://wallet.universalprofile.cloud/` + myProfile.upLukso}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{metadata.LSP3Profile.name}
                  </a>
                ) : (
                  <>@{metadata.LSP3Profile.name}</>
                )}
              </div>
              <div className="text-[#FFFFFF5C]">#{myProfile.up.slice(2, 6)}</div>
            </div>
            <div className="text-[#FFFFFFA3]">{"\u2022"}</div>
            <div className="bg-base-100 border border-base-200 rounded-sm px-2 p-0.5">
              🆙 <span className="text-[#FFFFFFA3]">{myProfile.up.slice(0, 6) + "..." + myProfile.up.slice(-4)}</span>
            </div>
            {accounts["github"] && (
              <>
                <div className="text-[#FFFFFFA3]">{"\u2022"}</div>
                <a
                  href={"https://github.com/" + accounts["github"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <div>
                    <Image width={14} height={14} alt="achievement icon" src="/link.svg" />
                  </div>
                  <div className="text-[#FFFFFFA3] underline mr-2">GitHub</div>
                </a>
              </>
            )}
            {accounts["buidlguidl"] && (
              <>
                <div className="text-[#FFFFFFA3]">{"\u2022"}</div>
                <a
                  href={"https://app.buidlguidl.com/builders/" + accounts["buidlguidl"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <div>
                    <Image width={14} height={14} alt="achievement icon" src="/link.svg" />
                  </div>
                  <div className="text-[#FFFFFFA3] underline mr-2">BuidlGuidl</div>
                </a>
              </>
            )}
            {/* {metadata.LSP3Profile.links.map((link: { title: string; url: string }, index: number) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={link.title}
                  className="flex items-center gap-1"
                >
                  <div>
                    <Image width={14} height={14} alt="achievement icon" src="/link.svg" />
                  </div>
                  <div className="text-[#FFFFFFA3] underline mr-2">{link.title}</div>
                  {index < metadata.LSP3Profile.links.length - 1 && <div className="text-[#FFFFFFA3]">{"\u2022"}</div>}
                </a>
              ))} */}
          </div>
        </div>
        <div>
          <div className="text-[#FFFFFFA3]">Bio</div>
          <div>{metadata.LSP3Profile.description}</div>
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
    </section>
  );
}
