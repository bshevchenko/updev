import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";

const socialAccounts = [
  {
    title: "Buildbox",
    logo: "/link.svg",
    comingSoon: false,
    text: "Connect your buildbox.io account to verify your proof-of-account-ownership and earn achievements related to hackathons and bounties.",
  },
  {
    title: "Github",
    logo: "/github.svg",
    comingSoon: false,
    text: "Connect your github account to verify your proof-of-account-ownership and earn achievements related to your code commits and activity.",
  },
  {
    title: "BuidlGuidl",
    logo: "/link.svg",
    comingSoon: false,
    text: "Connect your buidlguidl account to verify your proof-of-account-ownership and earn achievements related to your scaffold-eth-2 builds, your role and your stream.",
  },
  {
    title: "LinkedIn",
    logo: "/linkedin.svg",
    comingSoon: true,
    text: "Connect your linkedin account to verify your proof-of-account-ownership and earn achievements related to your number of connections and your Web3 employment.",
  },
  {
    title: "GitCoin Passport",
    logo: "/passport.svg",
    comingSoon: true,
    text: "Connect your gitcoin passport to verofy your proof-of-account-ownership and earn achievements related to your number of points.",
  },
];

export const ConnectSocialAccounts = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const renderModalContent = (title: string) => {
    const account = socialAccounts.find(account => account.title === title);
    return (
      <div>
        <h2 className="text-2xl font-bold">How to Connect {account?.title}</h2>
        <p className="text-lg">{account?.text}</p>
        {/* Additional content or forms specific to the social account can go here */}
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
              <p className="text-base-content my-0">{item.text}</p>
            </div>
            <button onClick={() => setActiveModal(item.title)} className="btn btn-primary" disabled={item.comingSoon}>
              Connect
            </button>
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
