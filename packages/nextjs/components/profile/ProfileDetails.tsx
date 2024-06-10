import { useEffect, useState } from "react";
import Image from "next/image";
import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { toHex } from "viem";
import { useContractWrite } from "wagmi";
import { CheckCircleIcon, MapPinIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { convertIpfsUrl } from "~~/utils/helpers";

export function ProfileDetails({
  up,
  metadata,
  isMyProfile,
}: {
  up: string;
  metadata: any;
  isMyProfile: boolean | undefined;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [displayedUsername, setDisplayedUsername] = useState(metadata.LSP3Profile.name);

  // enables user to start from current username when editing
  useEffect(() => {
    setUsernameInput(metadata.LSP3Profile.name);
  }, [metadata.LSP3Profile.name]);

  const { writeAsync: updateUpDevUsername, isLoading } = useContractWrite({
    address: up,
    abi: UniversalProfileContract.abi,
    functionName: "setData",
    args: [toHex("username", { size: 32 }), toHex(usernameInput)],
  });

  const handleSubmit = async () => {
    await updateUpDevUsername();
    setDisplayedUsername(usernameInput);
    setIsEditing(false);
  };

  return (
    <section>
      <div className="relative mb-3 md:min-w-[48rem] min-w-[24rem]">
        <div className="w-full h-[200px] bg-base-200 rounded-xl overflow-hidden relative">
          <Image
            alt="cover picture"
            fill
            src={
              up == "0x2ee97Dd93b77796bb79d9F33E3AD64B1FcF88b03"
                ? "https://api.universalprofile.cloud/image/QmW6KQr6uZZaLQfVBUGULDoU1jv88zNvcQ2grKyDbRjAEY?width=1760&dpr=2"
                : convertIpfsUrl("ipfs://bafybeid2tcmtlzmpmrlg4h4eomajvt2vpzpq7bo76ymwcyw5f5oedhyvc4/")
            }
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute -bottom-5 sm:-bottom-16 left-5 w-32">
          <div className="rounded-full overflow-hidden w-full h-full border-[4px] border-base-300">
            <Image
              alt="profile picture"
              width={500}
              height={500}
              src={convertIpfsUrl(metadata.LSP3Profile.profileImage[0].url)}
              priority
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-10 w-full sm:pl-40 sm:pt-0 pl-5 pt-5">
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
            <h3 className="text-2xl mb-0 font-bold">{displayedUsername}</h3>
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
            // <PencilSquareIcon className="w-6 h-6 text-secondary cursor-pointer" onClick={() => setIsEditing(true)} />
            ""
          ) : null}
          <div className="bg-base-100 border border-base-200 rounded-sm">
            <div className="dropdown dropdown-end leading-3">
              <label
                tabIndex={0}
                className="btn btn-secondary border-base-200 bg-base-100 btn-sm pl-0 pr-0 dropdown-toggle gap-0 !h-auto"
              >
                <span className="p-1 text-green-400 font-normal flex items-center">
                  <Image
                    alt="Universal Profile"
                    className="h-5 w-5"
                    width={50}
                    height={50}
                    priority
                    src="https://universalprofile.cloud/assets/images/up-logo.png"
                  />
                  &nbsp;
                  {up.slice(0, 4) + "..." + up.slice(-4)}
                </span>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-[2] p-2 mt-2 shadow-center border border-gray-500 bg-black rounded-box gap-1"
              >
                <li>
                  <div className="btn-sm !rounded-xl flex gap-3 py-3">
                    <Image
                      alt="Lukso"
                      className="h-6 w-4"
                      width={50}
                      height={50}
                      src="https://www.lukso.network/assets/images/logos/LUKSO_icon.svg"
                      priority
                    />
                    <span className="whitespace-nowrap">
                      <a
                        target="_blank"
                        href={"https://explorer.execution.testnet.lukso.network/address/" + up}
                        rel="noopener noreferrer"
                        className="whitespace-nowrap"
                      >
                        Explore on Lukso
                      </a>
                    </span>
                  </div>
                </li>
                <li>
                  <div className="btn-sm !rounded-xl flex gap-3 py-3">
                    <svg
                      className="h-6 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="100"
                      height="100"
                      viewBox="0 0 48 48"
                    >
                      <path fill="#9fa8da" d="M11 24L25 2 39 24 25 32z"></path>
                      <path fill="#7986cb" d="M25 2L39 24 25 32z"></path>
                      <path fill="#9fa8da" d="M11 27L25 35 39 27 25 46z"></path>
                      <path fill="#7986cb" d="M25 35L39 27 25 46zM11 24L25 18 39 24 25 32z"></path>
                      <path fill="#5c6bc0" d="M25 18L39 24 25 32z"></path>
                    </svg>
                    <span className="whitespace-nowrap">
                      <a
                        target="_blank"
                        href={"https://sepolia.etherscan.io/address/" + up}
                        rel="noopener noreferrer"
                        className="whitespace-nowrap"
                      >
                        Explore on Ethereum
                      </a>
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          {/* <div className="text-[#FFFFFFA3]">Bio</div> */}
          {metadata.LSP3Profile.description}
        </div>
        {metadata.LSP3Profile.location && (
          <div className="text-gray-300">
            <div>
              <MapPinIcon className="w-6 h-6 inline" /> {metadata.LSP3Profile.location}
            </div>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {/* {["hello", "my", "friend"].map((tag: string) => (
            <div
              key={tag}
              className="text-accent font-semibold bg-base-100 px-2 py-0.5 rounded-md border border-base-200"
            >
              {tag}
            </div>
          ))} */}
        </div>
      </div>
    </section>
  );
}
