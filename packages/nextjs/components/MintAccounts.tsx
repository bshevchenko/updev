import Image from "next/image";
import axios from "axios";
import Modal from "./Modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import accounts from "./accounts";
import popupCenter from "./popupCenter";
import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { signMessage } from "@wagmi/core";
import { utils } from "ethers";
import { LoginButton } from "@telegram-auth/react";
import { signIn, useSession } from "next-auth/react";
import { useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import toast from "react-hot-toast";

export const MintAccounts = ({ up }: { up: string }) => {
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

  useEffect(() => {
    console.log("TOKENS", tokens);
  }, [tokens]);

  useEffect(() => {
    console.log("REQUESTS", requests);
  }, [requests]);

  useEffect(() => {
    console.log("Fetching requests...");
    axios.get("/api/requests?up=" + up).then(result => {
      for (let request of result.data) {
        console.log("UPDATING REQUESTS WITH", request);
        updateRequests(request.requestId, request);
      }
    })
    fetchTokens();
  }, []);

  useScaffoldEventSubscriber({
    contractName: "upDevAccountNFT",
    eventName: "Requested",
    listener: logs => {
      logs.map(log => {
        const { requestId, up: _up, tokenId, provider, version, id } = log.args;
        if (up != _up || !requestId) {
          return; // TODO how to subscribe only to up's events?
        }
        updateRequests(requestId, { tokenId, provider, version, id });
        toast(`"${provider}" minting successfully requested! Verifying account...`);
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
          return; // TODO how to subscribe only to up's events?
        }
        try {
          updateRequests(requestId, { isFulfilled: true, isOK });
          const { provider, id } = requestsRef.current[requestId];
          toast(isOK ? `"${provider}" account successfully verified! Claiming NFT...` : "Account NFT minting failed...");
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
          return; // TODO how to subscribe only to up's events?
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
        toast(`"${provider}" account NFT successfully claimed!`);
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
    } catch (e) {
      toast("Oops! Minting failed :( Please try again later or contact us."); // TODO f.e. too many requests
      console.error("Minting Error", e);
    }
    updateIsMinting(provider, false);
  }

  function handleStartMint(provider: string) {
    setIsMintStarted(provider);
    popupCenter("/oauth/" + provider, provider)
  }

  useEffect(() => {
    console.log("REQUESTS", requests);
  }, [requests]);

  const session = useSession();
  useEffect(() => {
    if (!session || session.status != "authenticated") {
      return;
    }
    const { account } = session.data;
    if (account.provider == isMintStarted && !isMinting[account.provider]) {
      handleMint(account.provider, account.access_token, account.providerAccountId);
    }
    console.log("SESSION...", session);
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
      <div className="flex gap-5 items-center w-full">
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
        {Object.entries(requests).map(([key, value]) => {
          if (!value.isClaimed) {
            return (
              <div key={key}>
                {value.provider}@{value.version} - {value.id} - {value.isFulfilled ? (value.isOK ? "Claiming..." : "Failed") : "Verifying..."}
              </div>
            )
          }
        })}
        {accounts.map(item => (
          <div
            key={item.title}
            className="flex bg-base-100 w-full p-5 justify-between items-center rounded-xl border border-base-200 gap-24"
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
            <button
              onClick={() => item.isModal ? setActiveModal(item) : handleStartMint(item.name)}
              className="btn bg-primary text-primary-content hover:bg-primary w-[117px]"
              disabled={item.comingSoon || isMintStarted != null || isMinting[item.name]}>
              {isMintStarted == item.name || isMinting[item.name] ? "Minting..." : "Mint"}
            </button>
          </div>
        ))}
      </div>
      {activeModal && (
        <Modal isOpen={activeModal !== null} onClose={closeModal}>
          {renderModalContent(activeModal)}
        </Modal>
      )}
    </div>
  );
};
