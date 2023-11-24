import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components/updev/";
import { ConnectUniversalProfilePage, DeployUniversalProfilePage } from "~~/components/updev/onboarding/";

// import { ConnectSocialAccounts } from "~~/components/updev/onboarding/"; TODO

const Home: NextPage = () => {
  const account = useAccount();

  const [upExtensionAvailable, setUpExtensionAvailable] = useState(false);
  const [upConnected, setUpConnected] = useState(false);

  useEffect(() => {
    setUpExtensionAvailable(!!window.lukso);
  }, []);

  return (
    <>
      <MetaHeader />

      {!account.isConnected ? (
        <LandingDisplay />
      ) : (
        <div className="flex items-center flex-col flex-grow py-14">
          <div className="text-center mb-8">
            <h3 className="text-4xl font-bold mb-4">Set up your upDev account</h3>
            <p className="my-0 text-lg">Complete 3 steps to onboard to the dApp</p>
          </div>

          {!upConnected ? (
            <ConnectUniversalProfilePage upExtensionAvailable={upExtensionAvailable} setUpConnected={setUpConnected} />
          ) : (
            // TODO <ConnectSocialAccounts />
            <DeployUniversalProfilePage />
          )}
        </div>
      )}
    </>
  );
};

export default Home;
