import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Accounts from "./Accounts";
import Modal from "./Modal";
import popupCenter from "./popupCenter";
import providers from "./providers";
import { signMessage } from "@wagmi/core";
import axios from "axios";
import crypto from "crypto";
import { utils } from "ethers";
import { useSession } from "next-auth/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

export const MintAccounts = ({ up, isMyProfile }: { up: string; isMyProfile: boolean }) => {
  const [activeModal, setActiveModal] = useState<object | null>(null);
  const [copied, setCopied] = useState(false);
  const [id, setId] = useState("");
  const [isMintStarted, setIsMintStarted] = useState<string | null>(null);
  const [isFetchingTokens, setIsFetchingTokens] = useState<boolean>(false);

  const [isMinting, setIsMinting] = useState<object>({});
  const updateIsMinting = (key: string, newValue: string | number | boolean) => {
    setIsMinting((prevState: any) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const [isSigning, setIsSigning] = useState<object>({});
  const updateIsSigning = (key: string, newValue: string | number | boolean) => {
    setIsSigning((prevState: any) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const requestsRef = useRef({});
  const [requests, setRequests] = useState<object>({});
  const updateRequests = (key: string, newValue: object) => {
    requestsRef.current = {
      ...requestsRef.current,
      [key]: {
        // @ts-ignore
        ...(requestsRef.current[key] ? requestsRef.current[key] : {}),
        ...newValue,
      },
    };
    setRequests(requestsRef.current);
  };

  const [tokens, setTokens] = useState<object>({});
  const fetchTokens = () => {
    console.log("Fetching tokens...");
    setIsFetchingTokens(true);
    axios.get("/api/tokens?up=" + up).then(result => {
      const tokens = {};
      for (const token of result.data) {
        // @ts-ignore
        tokens[token.provider + "-" + token.id] = token;
      }
      console.log("Tokens", tokens);
      setTokens(tokens);
      setIsFetchingTokens(false);
    });
  };
  const updateTokens = (key: string, newValue: object) => {
    setTokens((prevState: any) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const fetchRequests = () => {
    console.log("Fetching requests...");
    axios.get("/api/requests?up=" + up).then(result => {
      for (const request of result.data) {
        updateRequests(request.requestId, request);
      }
    });
  };

  // const initialized = useRef(false);
  useEffect(() => {
    // if (initialized.current) {
    //   return;
    // }
    // initialized.current = true;
    fetchRequests();
    fetchTokens();
    setTimeout(() => {
      fetchRequests();
    }, 5000);
  }, []);

  useScaffoldEventSubscriber({
    contractName: "upDevAccountNFT",
    eventName: "Requested",
    listener: logs => {
      logs.map(log => {
        const { requestId, up: _up, tokenId, provider, version, id } = log.args;
        if (up != _up || !requestId) {
          return; // TODO how to subscribe only to up"s events?
        }
        updateRequests(String(requestId), { tokenId, provider, version, id });
        toast.loading(`"${provider}" minting successfully requested! Verifying account...`);
      });
    },
  });

  useScaffoldEventSubscriber({
    contractName: "upDevAccountNFT",
    eventName: "Fulfilled",
    listener: logs => {
      logs.map(log => {
        const { requestId, up: _up, isOK } = log.args;
        if (up != _up || !requestId) {
          return;
        }
        try {
          updateRequests(String(requestId), { isFulfilled: true, isOK }); // @ts-ignore
          const { provider } = requestsRef.current[requestId];
          if (isOK) {
            toast.loading(`"${provider}" account successfully verified! Claiming NFT...`);
          } else {
            toast.error("Account NFT minting failed...");
          }
        } catch (e) {
          console.error(e);
        }
      });
    },
  });

  useScaffoldEventSubscriber({
    contractName: "upDevAccountNFT",
    eventName: "Claimed",
    listener: logs => {
      logs.map(async log => {
        const { requestId, up: _up, data: _data, tokenId } = log.args;
        if (up != _up || !requestId || !_data) {
          return;
        }
        updateRequests(String(requestId), { isClaimed: true });
        const { provider, id, version } = requestsRef.current[requestId as keyof typeof requestsRef.current];
        const name = provider + "-" + id;
        let data = utils.toUtf8String(String(_data));
        const isIPFS = data.slice(0, 2) == "Qm";
        if (isIPFS) {
          const { data: ipfs } = await axios.get("https://gateway.pinata.cloud/ipfs/" + data);
          data = ipfs;
        }
        updateTokens(name, {
          tokenId,
          requestId,
          up,
          provider,
          version,
          id,
          isIPFS,
          data,
        });
        toast.success(`"${provider}" account NFT successfully claimed!`);
      });
    },
  });

  async function handleMint(provider: string, token: string | object, id: string) {
    updateIsMinting(provider, true);
    updateIsSigning(provider, true);

    if (provider == "telegram") {
      // @ts-ignore
      id = session.data.account.providerAccountId;
      token = {
        chatId: id, // @ts-ignore
        data: session.data.user.email,
      };
    }

    const message = crypto
      .createHash("md5")
      .update(token + id)
      .digest("hex");
    let signature;
    try {
      toast("Please sign mint request in your wallet.");
      signature = await signMessage({ message });
    } catch (e) {
      setIsMintStarted(null);
      updateIsMinting(provider, false);
      updateIsSigning(provider, false);
      return;
    }
    updateIsSigning(provider, false);
    setIsMintStarted(null);
    closeModal();
    const data = {
      up,
      provider,
      token,
      id,
      signature,
    };
    console.log("Minting...", data);
    try {
      await axios.post("/api/account", data);
      console.log("Minting request OK", provider);
    } catch (e: any) {
      toast.error("Oops! Minting failed :( " + e.message);
      console.error("Minting Error", e);
    }
    updateIsMinting(provider, false);
  }

  function handleStartMint(provider: string) {
    setIsMintStarted(provider);
    popupCenter("/oauth/" + provider, provider);
  }

  const session = useSession();
  useEffect(() => {
    console.log("SESSION", session);
    if (!session || session.status != "authenticated") {
      return;
    } // @ts-ignore
    const { account } = session.data;
    if (account.provider == isMintStarted && !isMinting[account.provider as keyof typeof isMinting]) {
      handleMint(account.provider, account.access_token, account.providerAccountId);
    }
  }, [session, isMintStarted, isMinting]);

  const closeModal = () => {
    setActiveModal(null);
    setCopied(false);
    setId("");
  };

  const renderModalContent = (item: any) => {
    const account = providers.find(account => account.name === item.name);
    let step1Contents;
    if (!item.isCustom) {
      step1Contents = item.step1Contents.replace("{up}", up);
    } // @ts-ignore
    const isAuthenticatedTelegram = session.status == "authenticated" && session.data.account.provider == "telegram"; // @ts-ignore
    const telegramName = isAuthenticatedTelegram ? session.data.user.name : "";
    return (
      <div className="flex gap-5 items-center">
        {account?.modalImage && (
          <div className="rounded-lg overflow-hidden hidden lg:flex">
            <Image alt="brand logo" width={400} height={400} src={account?.modalImage} />
          </div>
        )}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold mb-14">Mint {account?.title}</h2>
          <ol className="list-decimal list-inside">
            <li className="text-xl">{account?.step1}</li>
            <div className="flex items-center gap-5 mt-2 mb-5">
              {!item.isCustom && (
                <>
                  <div className="bg-base-200 border-base-100 border p-3 rounded-xl my-3 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {step1Contents}
                  </div>
                  <CopyToClipboard text={step1Contents} onCopy={() => setCopied(true)}>
                    <button className="">
                      {copied ? (
                        <CheckCircleIcon className="w-6 cursor-pointer" />
                      ) : (
                        <DocumentDuplicateIcon className="w-6 cursor-pointer" />
                      )}
                    </button>
                  </CopyToClipboard>
                </>
              )}
              {item.isCustom && <>{item.step1Contents}</>}
            </div>
            {item.isCustom && (
              <>
                {isAuthenticatedTelegram && (
                  <>
                    <p className="flex-row mt-3 text-xl">
                      You have signed in as <b className="text-green-400">{telegramName}</b>
                    </p>
                  </>
                )}
              </>
            )}
            {!item.isCustom && (
              <>
                <li className="text-xl mt-8">
                  {account?.step2}
                  <div className="flex items-center my-2 gap-3 w-full">
                    <input
                      type="text"
                      value={id}
                      placeholder={item.step2Placeholder || ""}
                      className="border border-base-200 p-2 rounded-xl my-3 bg-base-200 grow"
                      onChange={e => setId(e.target.value)}
                    />
                  </div>
                </li>
              </>
            )}
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => handleMint(item.name, "", id)}
                disabled={
                  (isMinting && isMinting[item.name as keyof typeof isMinting]) ||
                  (!isAuthenticatedTelegram && account?.name == "telegram")
                }
              >
                {isMinting && isMinting[item.name as keyof typeof isMinting] ? (
                  <>{isSigning[item.name as keyof typeof isSigning] ? "Signing..." : "Minting..."}</>
                ) : (
                  "Mint"
                )}
              </button>
            </div>
          </ol>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 w-full gap-5">
        <div className="flex gap-3 sm:ml-[160px] ml-5 mt-[-40px] mb-5">
          <div className="tooltip tooltip-primary w-16 h-16" data-tip="Universal Profile Owner">
            <Image fill alt="achievement icon" src="/achievements/up.svg" priority />
          </div>
          <div className="tooltip tooltip-primary w-16 h-16" data-tip="upDev Early Adopter">
            <Image fill alt="achievement icon" src="/achievements/og-updev.svg" priority />
          </div>
          {Object.entries(tokens).some(([, value]) => value.provider == "github") && (
            <div className="tooltip tooltip-primary w-16 h-16" data-tip="GitHub Member">
              <Image fill alt="achievement icon" src="/achievements/github.svg" priority />
            </div>
          )}
          {Object.entries(tokens).some(([, value]) => value.provider == "buidlguidl") && (
            <div className="tooltip tooltip-primary w-16 h-16" data-tip="BuidlGuidl Member">
              <Image fill alt="achievement icon" src="/achievements/buidlguidl.svg" priority />
            </div>
          )}
        </div>
        <Accounts isFetchingTokens={isFetchingTokens} tokens={tokens} />
        {Object.entries(requests).length > 0 && (
          <div className="mt-3 mb-5 ml-3 mr-3">
            {Object.entries(requests).map(([key, req]) => {
              if (!req.isClaimed) {
                return (
                  <div key={key} className="flex items-center">
                    {!req.isFulfilled && <span className="loading loading-spinner loading-lg w-6 h-6 mr-2"></span>}
                    <b>
                      {req.provider}@{req.version}
                    </b>
                    &nbsp;{req.isFulfilled ? (req.isOK ? "Claiming..." : "Failed") : "Verifying..."}
                  </div>
                );
              }
            })}
          </div>
        )}
        {isMyProfile && (
          <div className="md:ml-0 ml-3 mr-3 md:mr-0">
            <h3 className="text-2xl font-bold mb-3">Mint NFTs</h3>
            {providers.map(item => (
              <div
                key={item.name}
                className="flex bg-base-100 w-full p-5 mb-5 justify-between items-center rounded-xl border border-base-200 gap-24"
              >
                <div>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-6 h-6">
                      <Image fill alt="brand logo" src={item.logo} />
                    </div>
                    <h5 className="text-xl font-bold">{item.title}</h5>
                    {item.comingSoon && (
                      <div className="text-accent font-semibold border-2 border-accent rounded-md px-1">
                        Coming soon
                      </div>
                    )}
                    {item.test && (
                      <div className="text-accent font-semibold border-2 border-accent rounded-md px-1">Test</div>
                    )}
                  </div>
                </div>
                {!item.comingSoon && (
                  <button
                    onClick={() => (item.isModal ? setActiveModal(item) : handleStartMint(item.name))}
                    className="btn bg-primary text-primary-content hover:bg-primary w-42"
                    disabled={isMinting[item.name as keyof typeof isMinting]}
                  >
                    {isMinting && isMinting[item.name as keyof typeof isMinting] ? (
                      <>{isSigning[item.name as keyof typeof isSigning] ? "Signing..." : "Minting..."}</>
                    ) : (
                      "Mint"
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {activeModal && <Modal onClose={closeModal}>{renderModalContent(activeModal)}</Modal>}
    </div>
  );
};
