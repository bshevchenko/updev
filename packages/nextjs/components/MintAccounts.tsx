import Image from "next/image";
import axios from "axios";
import Modal from "./Modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import accounts from "./accounts";
import popupCenter from "./popupCenter";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon, CheckBadgeIcon, UsersIcon, ArchiveBoxIcon, DocumentIcon, CalendarDaysIcon, HandThumbUpIcon, ChatBubbleLeftRightIcon,
  AtSymbolIcon, LockClosedIcon, UserCircleIcon, AcademicCapIcon
} from "@heroicons/react/24/outline";
import { signMessage } from "@wagmi/core";
import { utils } from "ethers";
import { LoginButton } from "@telegram-auth/react";
import { signIn, useSession } from "next-auth/react";
import { useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import toast from "react-hot-toast";
import moment from "moment";

export const MintAccounts = ({ up, isMyProfile }: { up: string, isMyProfile: boolean }) => {
  const [activeModal, setActiveModal] = useState<{} | null>(null);
  const [copied, setCopied] = useState(false);
  const [id, setId] = useState("");
  const [isMintStarted, setIsMintStarted] = useState<string | null>(null);

  const [isMinting, setIsMinting] = useState<object>({});
  const updateIsMinting = (key: string, newValue: string | number | boolean) => {
    setIsMinting((prevState: any) => ({
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
        ...(requestsRef.current[key] ? requestsRef.current[key] : {}),
        ...newValue,
      },
    };
    setRequests(requestsRef.current);
  };

  const [tokens, setTokens] = useState<object>({});
  const fetchTokens = () => {
    console.log("Fetching tokens...");
    axios.get("/api/tokens?up=" + up).then(result => {
      const tokens = {}
      for (let token of result.data) {
        tokens[token.provider + "-" + token.id] = token;
      }
      setTokens(tokens);
    })
  }
  const updateTokens = (key: string, newValue: object) => {
    setTokens((prevState: any) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    console.log("Fetching requests...");
    axios.get("/api/requests?up=" + up).then(result => {
      for (let request of result.data) {
        updateRequests(request.requestId, request);
      }
    })
    fetchTokens();
  });

  useScaffoldEventSubscriber({
    contractName: "upDevAccountNFT",
    eventName: "Requested",
    listener: logs => {
      logs.map(log => {
        const { requestId, up: _up, tokenId, provider, version, id } = log.args;
        if (up != _up || !requestId) {
          return; // TODO how to subscribe only to up"s events?
        }
        updateRequests(requestId, { tokenId, provider, version, id });
        toast.loading(`"${provider}" minting successfully requested! Verifying account...`);
      });
    },
  })

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
          updateRequests(requestId, { isFulfilled: true, isOK });
          const { provider, id } = requestsRef.current[requestId];
          toast.loading(isOK ? `"${provider}" account successfully verified! Claiming NFT...` : "Account NFT minting failed...");
        } catch (e) {
          console.error(e);
        }
      });
    },
  })

  useScaffoldEventSubscriber({
    contractName: "upDevAccountNFT",
    eventName: "Claimed",
    listener: logs => {
      logs.map(async (log) => {
        let { requestId, up: _up, data: _data, tokenId } = log.args;
        if (up != _up || !requestId || !_data) {
          return;
        }
        updateRequests(requestId, { isClaimed: true });
        const { provider, id, version } = requestsRef.current[requestId];
        const name = provider + "-" + id;
        let data = utils.toUtf8String(_data);
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
          data
        })
        toast.success(`"${provider}" account NFT successfully claimed!`);
      });
    },
  })

  async function handleMint(provider: string, token: string, id: string) {
    updateIsMinting(provider, true);
    const message = utils.keccak256(utils.toUtf8Bytes(token + id));
    let signature;
    try {
      signature = await signMessage({ message });
    } catch (e) {
      setIsMintStarted(null);
      updateIsMinting(provider, false);
      return;
    }
    setIsMintStarted(null);
    closeModal();
    const data = {
      up,
      provider,
      token,
      id,
      signature
    }
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
    popupCenter("/oauth/" + provider, provider)
  }

  const session = useSession();
  useEffect(() => {
    if (!session || session.status != "authenticated") {
      return;
    }
    const { account } = session.data;
    if (account.provider == isMintStarted && !isMinting[account.provider]) {
      handleMint(account.provider, account.access_token, account.providerAccountId);
    }
  }, [session, isMintStarted, isMinting]);

  const closeModal = () => {
    setActiveModal(null);
    setCopied(false);
    setId("");
  };

  const renderModalContent = (item: any) => {
    const account = accounts.find(account => account.title === item.title);
    const step1Contents = item.step1Contents.replace("{up}", up);
    return (
      <div className="flex gap-5 items-center">
        {account?.modalImage && <div className="rounded-lg overflow-hidden hidden lg:flex">
          <Image alt="brand logo" width={400} height={400} src={account?.modalImage} />
        </div>}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold mb-14">Mint {account?.title}</h2>
          <ol className="list-decimal list-inside">
            <li className="text-xl">{account?.step1}</li>
            <div className="flex items-center gap-5 mt-2 mb-5">
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
            </div>
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
              <div className="flex justify-end">
                <button className="btn btn-primary" onClick={() => handleMint(item.name, "", id)}
                  disabled={isMinting && isMinting[item.name]}>
                  {isMinting && isMinting[item.name] ? "Minting..." : "Mint"}
                </button>
              </div>
            </li>
          </ol>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 w-full gap-5">
        {/* <LoginButton
          botUsername={process.env.TELEGRAM_BOT_USERNAME || "upDev_auth_bot"}
          onAuthCallback={(data) => {
            signIn("telegram", {}, data as any);
          }}
        /> */}
        <div className="flex gap-3 sm:ml-[160px] ml-5 mt-[-40px] mb-5">
          <div className="tooltip tooltip-primary w-16 h-16" data-tip="Universal Profile Owner">
            <Image fill alt="achievement icon" src="/achievements/up.svg" priority />
          </div>
          <div className="tooltip tooltip-primary w-16 h-16" data-tip="upDev Early Adopter">
            <Image fill alt="achievement icon" src="/achievements/og-updev.svg" priority />
          </div>
          {Object.entries(tokens).some(([key, value]) => value.provider == "github") && <div className="tooltip tooltip-primary w-16 h-16" data-tip="GitHub">
            <Image fill alt="achievement icon" src="/achievements/github.svg" priority />
          </div>}
          {Object.entries(tokens).some(([key, value]) => value.provider == "buidlguidl") && <div className="tooltip tooltip-primary w-16 h-16" data-tip="BuidlGuidl">
            <Image fill alt="achievement icon" src="/achievements/buidlguidl.svg" priority />
          </div>}
        </div>
        {/* <h3 className="text-2xl font-bold">Account NFTs</h3> */}
        <div className="flex flex-wrap">
          {Object.entries(tokens).map(([key, token]) => (
            <div className="w-275 bg-gray-900 p-5 mr-3 mb-5 rounded-xl lg:w-[244px] break-all w-full ml-3 lg:ml-0" key={key}>
              {token.provider == "github" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="github" width={46} height={46} src="/github.svg" priority />
                    <b className="ml-3">GitHub</b>
                  </div>
                  <div className="mb-3">
                    <a className="text-green-400 hover:underline"
                      target="_blank" href={`https://github.com/${token.data.login}`}>
                      @{token.data.login}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <CalendarDaysIcon className="w-6 mr-1" />
                    {moment(token.data.created_at).format("DD.MM.YYYY")}
                  </div>
                  {/* ({(() => { const a = moment().diff(token.data.created_at, "years", true); return a >= 1 ? `${moment().diff(token.data.created_at, "years")}y ${moment().diff(token.data.created_at, "months") % 12}m` : `${moment().diff(token.data.created_at, "months")} months` })()}) */}
                  <div className="flex items-center mt-3 mb-3">
                    <ArchiveBoxIcon className="w-6 mr-1" />
                    <a href={`https://github.com/${token.data.login}?tab=repositories`} className="text-green-400 hover:underline" target="_blank">{token.data.public_repos}</a>&nbsp;repos
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <DocumentIcon className="w-6 mr-1" />
                    <a href={`https://gist.github.com/${token.data.login}`} className="text-green-400 hover:underline" target="_blank">{token.data.public_gists}</a>&nbsp;gists
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <UsersIcon className="w-6 mr-1" />
                    <a href={`https://github.com/${token.data.login}?tab=followers`} className="text-green-400 hover:underline" target="_blank">{token.data.followers}</a>&nbsp;followers
                  </div>
                </>
              )}
              {token.provider == "google" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="google" width={46} height={46} src="/google.svg" priority />
                    <b className="ml-3">Google</b>
                  </div>
                  <div>
                    <a href={`mailto:${token.data.email}`} className="text-green-400 hover:underline" target="_blank">{token.data.email}</a>
                  </div>
                  {token.data.verified_email && (<div className="flex items-center mt-3 mb-3">
                    <CheckBadgeIcon className="w-6 mr-1" />
                    Verified
                  </div>)}
                </>
              )}
              {token.provider == "twitter" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="google" width={46} height={46} src="/x.svg" priority />
                    <b className="ml-3">Twitter</b>
                  </div>
                  <div className="mb-3">
                    <a className="text-green-400 hover:underline"
                      target="_blank" href={`https://x.com/${token.data.username}`}>
                      @{token.data.username}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <CalendarDaysIcon className="w-6 mr-1" />
                    {moment(token.data.created_at).format("DD.MM.YYYY")}
                  </div>
                  {token.data.verified_type != "none" && (<div className="flex items-center mt-3 mb-3 capitalize-first">
                    <CheckBadgeIcon className="w-6 mr-1" />
                    {token.data.verified_type}
                  </div>)}
                  <div className="flex items-center mt-3 mb-3">
                    <UsersIcon className="w-6 mr-1" />
                    <a href={`https://x.com/${token.data.login}/followers`} className="text-green-400 hover:underline" target="_blank">{token.data.public_metrics.followers_count}</a>&nbsp;followers
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <ChatBubbleLeftRightIcon className="w-6 mr-1" />
                    <a href={`https://x.com/${token.data.login}`} className="text-green-400 hover:underline" target="_blank">{token.data.public_metrics.tweet_count}</a>&nbsp;tweets
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <HandThumbUpIcon className="w-6 mr-1" />
                    <a href={`https://x.com/${token.data.login}`} className="text-green-400 hover:underline" target="_blank">{token.data.public_metrics.like_count}</a>&nbsp;likes
                  </div>
                </>
              )}
              {token.provider == "discord" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="discord" width={46} height={46} src="/discord.svg" priority />
                    <b className="ml-3">Discord</b>
                  </div>
                  <div>
                    <a href={`https://discord.com/users/${token.data.username}`} className="text-green-400 hover:underline" target="_blank">@{token.data.username}</a>
                  </div>
                  {token.data.verified && (<div className="flex items-center mt-3 mb-3">
                    <AtSymbolIcon className="w-6 mr-1" />
                    <a href={`mailto:${token.data.email}`} className="text-green-400 hover:underline" target="_blank">Verified Email</a>
                  </div>)}
                  {token.data.premium_type != "0" && (<div className="flex items-center mt-3 mb-3">
                    <CheckBadgeIcon className="w-6 mr-1" />
                    {token.data.premium_type == "1" && "Nitro Classic"}
                    {token.data.premium_type == "2" && "Nitro"}
                    {token.data.premium_type == "3" && "Nitro Basic"}
                  </div>)}
                  {token.data.mfa_enabled && (<div className="flex items-center mt-3 mb-3">
                    <LockClosedIcon className="w-6 mr-1" />
                    2FA enabled
                  </div>)}
                </>
              )}
              {token.provider == "buidlguidl" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="buidlguidl" width={46} height={46} src="/link.svg" priority />
                    <b className="ml-3">BuidlGuidl</b>
                  </div>
                  <div>
                    <a href={`https://app.buidlguidl.com/builders/${token.data.id}`} className="text-green-400 hover:underline" target="_blank">
                      {token.data.id.slice(0, 6) + "..." + token.data.id.slice(-4)}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <CalendarDaysIcon className="w-6 mr-1" />
                    {moment(token.data.creationTimestamp).format("DD.MM.YYYY")}
                  </div>
                  {token.data.ens && <div className="flex items-center mt-3 mb-3">
                    <AtSymbolIcon className="w-6 mr-1" />
                    <a href={`https://app.ens.domains/${token.data.ens}`} className="text-green-400 hover:underline" target="_blank">
                      {token.data.ens}
                    </a>
                  </div>}
                  <div className="flex items-center mt-3 mb-3">
                    <ArchiveBoxIcon className="w-6 mr-1" />
                    <a href={`https://github.com/${token.data.login}?tab=repositories`} className="text-green-400 hover:underline" target="_blank">{token.data.builds.length}</a>&nbsp;builds
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <UserCircleIcon className="w-6 mr-1" />
                    <span style={{ textTransform: "capitalize" }}>{token.data.function}</span>
                  </div>
                  {token.data.scholarship && <div className="flex items-center mt-3 mb-3">
                    <AcademicCapIcon className="w-6 mr-1" />
                    Scholarship
                  </div>}
                </>
              )}
              {token.provider == "https" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="website" width={46} height={46} src="/link.svg" priority />
                    <b className="ml-3">Website</b>
                  </div>
                  <div>
                    <a href={`https://${token.id}`} className="text-green-400 hover:underline" target="_blank">
                      {token.id}
                    </a>
                  </div>
                </>
              )}
              {/* {token.isIPFS && (
                <div className="text-right">
                  <button className="btn btn-secondary" onClick={() => {
                    alert(JSON.stringify(token.data))
                  }}>Show</button>
                </div>
              )} */}
            </div>
          ))}
        </div>
        {Object.entries(requests).length > 0 && <div className="mt-3">
          {
            Object.entries(requests).map(([key, req]) => {
              if (!req.isClaimed) {
                return (
                  <div key={key} className="flex items-center">
                    {!req.isFulfilled && <span className="loading loading-spinner loading-lg w-6 h-6 mr-2"></span>}
                    <b>{req.provider}@{req.version}</b>&nbsp;{req.isFulfilled ? (req.isOK ? "Claiming..." : "Failed") : "Verifying..."}
                  </div>
                )
              }
            })
          }
        </div>}
        {isMyProfile && <div className="md:ml-0 ml-3 mr-3 md:mr-0">
          <h3 className="text-2xl font-bold mb-3">Mint Account NFTs</h3>
          {
            accounts.map(item => (
              <div
                key={item.title}
                className="flex bg-base-100 w-full p-5 mb-5 justify-between items-center rounded-xl border border-base-200 gap-24"
              >
                <div>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-6 h-6">
                      <Image fill alt="brand logo" src={item.logo} />
                    </div>
                    <h5 className="text-xl font-bold">{item.title}</h5>
                    {item.comingSoon && (
                      <div className="text-accent font-semibold border-2 border-accent rounded-md px-1">Coming soon</div>
                    )}
                  </div>
                </div>
                {!item.comingSoon && <button
                  onClick={() => item.isModal ? setActiveModal(item) : handleStartMint(item.name)}
                  className="btn bg-primary text-primary-content hover:bg-primary w-42"
                  disabled={isMintStarted != null || isMinting[item.name]}>
                  {isMintStarted == item.name || isMinting[item.name] ? "Minting..." : "Mint"}
                </button>}
              </div>
            ))
          }
        </div>}
      </div >
      {
        activeModal && (
          <Modal isOpen={activeModal !== null} onClose={closeModal}>
            {renderModalContent(activeModal)}
          </Modal>
        )
      }
    </div >
  );
};
