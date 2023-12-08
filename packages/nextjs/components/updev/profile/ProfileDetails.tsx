import { useEffect, useState } from "react";
import Image from "next/image";
import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { hexToString, toHex } from "viem";
import { useContractWrite } from "wagmi";
import { CheckCircleIcon, PencilSquareIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Accounts } from "~~/pages/profile/[address]";
import upRegistryProfile from "~~/types/Profile";
import { convertIpfsUrl } from "~~/utils/helpers";

export function ProfileDetails({
  profile,
  metadata,
  upDevUsername,
  isMyProfile,
  isNotVerified,
  accounts,
  refetchUpDevUsername,
}: {
  profile: upRegistryProfile;
  metadata: any;
  upDevUsername: any;
  isMyProfile: boolean | undefined;
  isNotVerified: boolean;
  accounts: Accounts;
  refetchUpDevUsername: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [displayedUsername, setDisplayedUsername] = useState(hexToString(upDevUsername));

  // enables user to start from current username when editing
  useEffect(() => {
    if (upDevUsername && upDevUsername !== "0x") {
      setUsernameInput(hexToString(upDevUsername as `0x${string}`));
    } else {
      setUsernameInput(metadata.LSP3Profile.name);
    }
  }, [upDevUsername, metadata.LSP3Profile.name]);

  const { writeAsync: updateUpDevUsername, isLoading } = useContractWrite({
    address: profile?.up,
    abi: UniversalProfileContract.abi,
    functionName: "setData",
    args: [toHex("username", { size: 32 }), toHex(usernameInput)],
  });

  const handleSubmit = async () => {
    await updateUpDevUsername();
    setDisplayedUsername(usernameInput);
    await refetchUpDevUsername();
    setIsEditing(false);
  };

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
        <div className="flex items-center gap-3">
          {isEditing ? (
            <input
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              className="py-1 px-2 rounded-md bg-base-200 border border-white"
            />
          ) : isLoading ? (
            <div>Updating username...</div>
          ) : (
            <h3 className="text-2xl mb-0 font-bold">
              {upDevUsername !== "0x" ? displayedUsername : metadata.LSP3Profile.name}
            </h3>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button className="bg-accent p-1 rounded-full w-8" onClick={() => handleSubmit()}>
                <CheckCircleIcon className="w-6 h-6" />
              </button>
              <button
                className="bg-red-600 p-1 rounded-full"
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          ) : isMyProfile ? (
            <PencilSquareIcon className="w-6 h-6 text-secondary cursor-pointer" onClick={() => setIsEditing(true)} />
          ) : null}
        </div>
        <div className="flex gap-3 items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              <div className="text-[#FFFFFFA3]">
                {!isNotVerified && profile.upLukso ? (
                  <a
                    href={`https://wallet.universalprofile.cloud/` + profile.upLukso}
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
              <div className="text-[#FFFFFF5C]">#{profile.up.slice(2, 6)}</div>
            </div>
            <div className="text-[#FFFFFFA3]">{"\u2022"}</div>
            <div className="bg-base-100 border border-base-200 rounded-sm px-2 p-0.5">
              🆙 <span className="text-[#FFFFFFA3]">{profile.up.slice(0, 6) + "..." + profile.up.slice(-4)}</span>
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
