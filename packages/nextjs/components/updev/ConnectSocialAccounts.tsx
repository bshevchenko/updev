import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import axios from "axios";
import { useSession } from "next-auth/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useAccount, useWalletClient } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import Profile from "~~/types/Profile";

// TODO extract
const githubSecret =
  "0x9d62f03e674df42a6fe539f7321871a902f5185e8797bd4bc8aa7280805c7e1daddf5371811fe6980c132247eecdb447941970deae33d785b5018fa576a84eb1f0ca1af369109c70d94f6b4444029919ebe5f02e42b953fa6cfc99b097fb17f32308b03bf0e5d3a642184916a15273c34c1c52b18e40a6fd19d21e982bf5020ecd48215d6358ffdfda737216380fddfc294b70479e98aafde6dc74bf1867c2395d";

const socialAccounts = [
  {
    name: "github",
    title: "GitHub",
    logo: "/github.svg",
    comingSoon: false,
    description:
      "Connect your GitHub account to verify your proof-of-account-ownership and earn achievements related to your code commits and activity.",
    step1: (
      <>
        Edit your{" "}
        <a href="https://github.com" className="underline cursor-pointer text-accent" target="_blank" rel="noreferrer">
          GitHub profile
        </a>{" "}
        to include the following link
      </>
    ),
    step2: "Provide your GitHub username ( case sensitive )",
    modalImage: "/connect-github.png",
    url: "https://github.com",
  },
  {
    name: "buidlguidl",
    title: "BuidlGuidl",
    logo: "/link.svg",
    comingSoon: false,
    description:
      "Connect your buidlguidl account to verify your proof-of-account-ownership and earn achievements related to your scaffold-eth-2 builds, your role and your stream.",
    step1: (
      <>
        On your BuidlGuidl{" "}
        <a
          href="https://app.buidlguidl.com/"
          className="underline cursor-pointer text-accent"
          target="_blank"
          rel="noreferrer"
        >
          portfolio page
        </a>
        , update your status
      </>
    ),
    step2: "Provide address of EOA for your BuidlGuidl profile",
    modalImage: "/connect-bg.png",
    url: "https://app.buidlguidl.com/",
  },
  {
    name: "buidlbox",
    title: "buidlbox",
    logo: "/link.svg",
    comingSoon: true,
    description:
      "Connect your buildbox.io account to verify your proof-of-account-ownership and earn achievements related to hackathons and bounties.",
    step1: "",
    modalImage: "",
    url: " ",
  },
  {
    name: "gitcoin",
    title: "GitCoin Passport",
    logo: "/passport.svg",
    comingSoon: true,
    description:
      "Connect your gitcoin passport to verify your proof-of-account-ownership and earn achievements related to your number of points.",
    step1: "",
    modalImage: "",
    url: "",
  },
  {
    name: "twitter",
    title: "X / Twitter",
    logo: "/link.svg",
    comingSoon: true,
    description:
      "Connect your twitter/X account to verify your proof-of-account-ownership and earn achievements related to your level of activity and connections on crypto twitter.",
    step1: "",
    modalImage: "",
    url: "",
  },
  {
    name: "linkedin",
    title: "LinkedIn",
    logo: "/linkedin.svg",
    comingSoon: true,
    description:
      "Connect your linkedin account to verify your proof-of-account-ownership and earn achievements related to your number of connections and your Web3 employment.",
    step1: "",
    modalImage: "",
    url: "",
  },
];

export const ConnectSocialAccounts = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const account = useAccount(); // EOA connected to rainbow kit

  const [copied, setCopied] = useState(false);
  const [id, setId] = useState("");

  const { data: session } = useSession();

  const { data: up } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  const { data: walletClient } = useWalletClient();
  const { data: consumer } = useScaffoldContract({
    contractName: "upDevAccountNFT",
    walletClient,
  });

  const { data: requests } = useScaffoldContractRead({
    contractName: "upDevAccountNFT",
    functionName: "getUPRequests",
    args: [profile && profile.up],
  });

  useScaffoldEventSubscriber({
    contractName: "upDevFunctionsConsumer",
    eventName: "Response",
    listener: logs => {
      logs.map(log => {
        const { source, up, isOwned } = log.args;
        if (!profile) {
          return;
        }
        if (up != profile.up) {
          return; // TODO how to subscribe only to up's events?
        }
        if (isOwned) {
          alert(`Your ${source} account has been successfully verified. You can now claim your NFT.`); // TODO push nice toast message
        } else {
          alert(`Your ${source} account verification failed. Please try again.`);
        }
      });
    },
  });

  const isNotClaimed = (source: string) => {
    return requests && requests.some(r => r.source === source && r.isFinished && !r.isClaimed);
  };

  async function handleClaim(source: string) {
    // TODO isClaiming
    if (!requests) {
      return;
    }
    const request = requests.find(r => r.source === source && r.isFinished && !r.isClaimed);
    if (!request) {
      return;
    }
    try {
      await consumer?.write.claimToken([request.tokenId]);
    } catch (e) {
      console.error("Claim error:", e);
    }
  }

  async function handleTestServer() {
    // @ts-ignore
    if (session && session.provider == "twitter" && session.accessToken) {
      const result = await axios.get(
        // @ts-ignore
        "http://localhost:8000/?token=" + session.accessToken,
      );
      console.log("CURL", result.data);
    }
  }
  // TODO merge top func into bottom func
  async function handleVerify(sourceName: string, id: string) {
    if (!consumer || !profile) {
      return;
    }
    console.log("handleVerify", sourceName, id, profile.up);
    try {
      await consumer.write.sendRequest([
        877n,
        sourceName === "github" ? githubSecret : "0x",
        0,
        0n,
        sourceName,
        profile.up,
        id,
      ]);
      setActiveModal(null);
      alert("Your account will appear on your page once it is verified.");
    } catch (e) {
      console.error("handleVerify error", e);
    }
  }

  const popupCenter = (url: string, title: string) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;
    const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${550 / systemZoom},top=${top},left=${left}`,
    );

    newWindow?.focus();
  };

  const renderModalContent = (title: string) => {
    const account = socialAccounts.find(account => account.title === title);

    const link = `https://updev-v1.vercel.app/profile/${profile && profile.up}`;
    return (
      <div className="flex gap-5 items-center w-full">
        <div className="rounded-lg overflow-hidden hidden lg:flex">
          {account?.modalImage && <Image alt="brand logo" width={400} height={400} src={account?.modalImage} />}
        </div>
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold mb-14">How to Connect {account?.title}</h2>
          <ol className="list-decimal list-inside">
            <li className="text-xl">{account?.step1}</li>
            <div className="flex items-center gap-5 mt-2 mb-5">
              <div className="bg-base-200 border-base-100 border p-3 rounded-xl my-3 overflow-x-auto whitespace-nowrap hide-scrollbar">
                {link}
              </div>
              <CopyToClipboard text={link} onCopy={() => setCopied(true)}>
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
                  className="border border-base-200 p-2 rounded-xl my-3 bg-base-200 grow"
                  // style={{ backgroundColor: "#262626" }}
                  onChange={e => setId(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary" onClick={() => handleVerify(title.toLowerCase(), id)}>
                  Submit
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
      <button
        onClick={() => handleTestServer()}
        className="btn bg-primary text-primary-content hover:bg-primary w-[117px]"
      >
        WTF
      </button>

      <div className="flex flex-col gap-4 w-full gap-5">
        {socialAccounts.map(item => (
          <div
            key={item.title}
            className="flex bg-base-100 w-full p-5 justify-between items-center rounded-xl border border-base-200 gap-24"
          >
            <div>
              <div className="flex gap-3 items-center mb-3">
                <div className="relative w-6 h-6">
                  <Image fill alt="brand logo" src={item.logo} />
                </div>
                <h5 className="text-xl font-bold">{item.title}</h5>
                {item.comingSoon && (
                  <div className="text-accent font-semibold border-2 border-accent rounded-md px-1">Coming soon</div>
                )}
              </div>
              <p className="text-base-content my-0">{item.description}</p>
            </div>
            {isNotClaimed(item.name) ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveModal(item.title)}
                  className="btn bg-primary text-primary-content hover:bg-primary"
                  disabled={item.comingSoon}
                >
                  Reconnect
                </button>
                <button onClick={() => handleClaim(item.name)} className="btn bg-accent hover:bg-accent w-full">
                  Claim
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  item.name === "github" ? popupCenter("/signin", "Twitter Sign In") : setActiveModal(item.title)
                }
                className="btn bg-primary text-primary-content hover:bg-primary w-[117px]"
                disabled={item.comingSoon}
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
      {activeModal && (
        <Modal isOpen={activeModal !== null} onClose={() => setActiveModal(null)}>
          {renderModalContent(activeModal)}
        </Modal>
      )}
    </div>
  );
};
