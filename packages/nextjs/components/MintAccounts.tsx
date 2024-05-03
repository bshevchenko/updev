// import { useState } from "react";
import Image from "next/image";
import axios from "axios";
// import Modal from "./Modal";
// import { CopyToClipboard } from "react-copy-to-clipboard";
// import { useAccount } from "wagmi";
import socialAccounts from "./socialAccounts";
import popupCenter from "./popupCenter";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
// import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
// import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

// TODO deal with commented code

export const MintAccounts = ({ up }: { up: string }) => {
  // const [activeModal, setActiveModal] = useState<string | null>(null);
  const account = useAccount();

  // const [copied, setCopied] = useState(false);
  // const [id, setId] = useState("");

  // const { data: walletClient } = useWalletClient();
  // const { data: n } = useScaffoldContract({
  //   contractName: "upDevAccountNFT",
  //   walletClient,
  // });

  // useScaffoldEventSubscriber({
  //   contractName: "upDevFunctionsConsumer",
  //   eventName: "Response",
  //   listener: logs => {
  //     logs.map(log => {
  //       const { source, up, isOwned } = log.args;
  //       if (!profile) {
  //         return;
  //       }
  //       if (up != profile.up) {
  //         return; // TODO how to subscribe only to up's events?
  //       }
  //       if (isOwned) {
  //         alert(`Your ${source} account has been successfully verified. You can now claim your NFT.`); // TODO push nice toast message
  //       } else {
  //         alert(`Your ${source} account verification failed. Please try again.`);
  //       }
  //     });
  //   },
  // });

  // const isNotClaimed = (source: string) => {
  //   return requests && requests.some(r => r.source === source && r.isFinished && !r.isClaimed);
  // };

  async function handleMint() { // TODO
    try {
      await axios.post("/api/account", {
        up,
        provider: session.account.provider,
        token: session.account.access_token,
        id: session.account.providerAccountId
      });
      console.log("Minting OK", session.account.provider);
    } catch (e) {
      alert("Try again later..."); // TODO f.e. too many requests
      console.error("Minting Error", e);
    }
  }

  const [isPreparingMinting, setIsPreparingMinting] = useState(false);
  function handleStartMint(provider: string) {
    setIsPreparingMinting(true);
    popupCenter("/oauth/" + provider, provider)
  }

  const { data: session } = useSession();
  useEffect(() => {
    if (isPreparingMinting) {
      setIsPreparingMinting(false);
      console.log("MINTING SESSION...", session);
      handleMint();
    }
    // TODO if ? then handleMint(event.data.message);
  }, [session])

  // const renderModalContent = (title: string) => {
  //   const account = socialAccounts.find(account => account.title === title);
  //   const link = `https://updev-v1.vercel.app/profile/${profile && profile.up}`;
  //   return (
  //     <div className="flex gap-5 items-center w-full">
  //       <div className="rounded-lg overflow-hidden hidden lg:flex">
  //         {account?.modalImage && <Image alt="brand logo" width={400} height={400} src={account?.modalImage} />}
  //       </div>
  //       <div className="overflow-x-auto">
  //         <h2 className="text-2xl font-bold mb-14">How to Connect {account?.title}</h2>
  //         <ol className="list-decimal list-inside">
  //           <li className="text-xl">{account?.step1}</li>
  //           <div className="flex items-center gap-5 mt-2 mb-5">
  //             <div className="bg-base-200 border-base-100 border p-3 rounded-xl my-3 overflow-x-auto whitespace-nowrap hide-scrollbar">
  //               {link}
  //             </div>
  //             <CopyToClipboard text={link} onCopy={() => setCopied(true)}>
  //               <button className="">
  //                 {copied ? (
  //                   <CheckCircleIcon className="w-6 cursor-pointer" />
  //                 ) : (
  //                   <DocumentDuplicateIcon className="w-6 cursor-pointer" />
  //                 )}
  //               </button>
  //             </CopyToClipboard>
  //           </div>
  //           <li className="text-xl mt-8">
  //             {account?.step2}
  //             <div className="flex items-center my-2 gap-3 w-full">
  //               <input
  //                 type="text"
  //                 value={id}
  //                 className="border border-base-200 p-2 rounded-xl my-3 bg-base-200 grow"
  //                 // style={{ backgroundColor: "#262626" }}
  //                 onChange={e => setId(e.target.value)}
  //               />
  //             </div>
  //             <div className="flex justify-end">
  //               <button className="btn btn-primary" onClick={() => handleVerify(title.toLowerCase(), id)}>
  //                 Submit
  //               </button>
  //             </div>
  //           </li>
  //         </ol>
  //       </div>
  //     </div>
  //   );
  // };

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
                <div className="relative w-6 h-6">
                  <Image fill alt="brand logo" src={item.logo} />
                </div>
                <h5 className="text-xl font-bold">{item.title}</h5>
                {item.comingSoon && (
                  <div className="text-accent font-semibold border-2 border-accent rounded-md px-1">Coming soon</div>
                )}
              </div>
              {/* <p className="text-base-content my-0">{item.description}</p> */}
            </div>
            {/* {isNotClaimed(item.name) ? (
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
            )} */}
            <button
              onClick={() => handleStartMint(item.name)}
              className="btn bg-primary text-primary-content hover:bg-primary w-[117px]"
              disabled={item.comingSoon}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
      {/* {activeModal && (
        <Modal isOpen={activeModal !== null} onClose={() => setActiveModal(null)}>
          {renderModalContent(activeModal)}
        </Modal>
      )} */}
    </div>
  );
};
