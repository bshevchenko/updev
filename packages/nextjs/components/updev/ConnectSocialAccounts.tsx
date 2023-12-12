import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useAccount, useWalletClient } from "wagmi";
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import Profile from "~~/types/Profile";

// TODO extract
const githubSecret =
  "0xfd4b538303d011a1ee86361cf33af34803dddef3d4a9ebbe9b5a3e61e58d3625d4ae1abcdb4c48845182373d3115ac9639956c1df6723d66bb5ff713061605ffbe2e7e7f1e75a186a5e0db36723cc979af7ca318fa034e1eddbcc2711adcc1bd4f6c5f6702587e05aa721b011c1c5f0dfee6f8fb0dcbbbef414eb7776a1e93ad7c69b317d03f4fe080704397ef7ff702b516653c2314bb1753345703e63b0e82bf";

const socialAccounts = [
  {
    name: "github",
    title: "GitHub",
    logo: "/github.svg",
    comingSoon: false,
    description:
      "Connect your GitHub account to verify your proof-of-account-ownership and earn achievements related to your code commits and activity.",
    step1: "Edit your GitHub profile to include the following link",
    step2: "Submit your GitHub username:",
    modalImage: "/connectgithub.png",
    url: "https://github.com",
  },
  {
    name: "buidlguidl",
    title: "BuidlGuidl",
    logo: "/link.svg",
    comingSoon: false,
    description:
      "Connect your buidlguidl account to verify your proof-of-account-ownership and earn achievements related to your scaffold-eth-2 builds, your role and your stream.",
    step1: <>On your buidlguidl profile page, update your status to be</>,
    step2: "Provide address of EOA associated with your BuidlGuidl profile",
    modalImage: "/connectbuidlguidl.png",
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

  const { data: _profile } = useScaffoldContractRead({
    contractName: "upRegistry", // @ts-ignore
    functionName: "upByEOA",
    args: [account.address],
  }); // @ts-ignore
  const profile: Profile | undefined = _profile;

  const { data: walletClient } = useWalletClient();
  const { data: consumer } = useScaffoldContract({
    contractName: "upDevFunctionsConsumer",
    walletClient,
  });

  const { data: requests } = useScaffoldContractRead({
    contractName: "upDevFunctionsConsumer",
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

  useEffect(() => {
    console.log("Requests", requests);
  }, [requests]);

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

  const renderModalContent = (title: string) => {
    const account = socialAccounts.find(account => account.title === title);

    const link = `https://updev-v1.vercel.app/profile/${profile && profile.up}`;
    return (
      <div className="flex gap-5 items-center">
        <div className="rounded-lg overflow-hidden">
          {account?.modalImage && <Image alt="brand logo" width={300} height={400} src={account?.modalImage} />}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-14">How to Connect {account?.title}</h2>
          <ol className="list-decimal list-inside">
            <li className="text-xl">{account?.step1}</li>
            <div className="flex items-center gap-5 mt-2 mb-5">
              <div className="w-[550px] bg-white text-black border border-white p-3 rounded-xl my-3 overflow-x-auto whitespace-nowrap hide-scrollbar">
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
              <a href={account?.url} target="_blank" rel="noreferrer">
                <ArrowTopRightOnSquareIcon className="w-6 h-6 cursor-pointer" />
              </a>
            </div>
            <li className="text-xl mt-8">
              {account?.step2}
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="text"
                  value={id}
                  className="w-[550px] border border-base-200 p-2 rounded-xl my-3 bg-base-200"
                  // style={{ backgroundColor: "#262626" }}
                  onChange={e => setId(e.target.value)}
                />
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
      <div className="flex flex-col gap-4 w-full gap-5">
        {socialAccounts.map(item => (
          <div
            key={item.title}
            className="flex bg-base-100 w-full p-5 justify-between items-center rounded-xl border border-base-200 gap-24"
          >
            <div>
              <div className="flex gap-3 items-center mb-3">
                <Image alt="brand logo" width={24} height={24} src={item.logo} />
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
                onClick={() => setActiveModal(item.title)}
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
