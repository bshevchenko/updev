import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import ConnectUniversalProfileDisplay from "~~/components/steps/ConnectUniversalProfileDisplay";
import ConnectWalletDisplay from "~~/components/steps/ConnectWalletDisplay";
// import ConnectAccountsDisplay from "~~/components/steps/ConnectAccountsDisplay"; TODO
import DeployUPDisplay from "~~/components/steps/DeployUPDisplay";

const Home: NextPage = () => {
  const account = useAccount();

  const [upExtensionAvailable, setUpExtensionAvailable] = useState(false);
  const [upConnected, setUpConnected] = useState(false);

  console.log("upConnected", upConnected);

  // const [builders, setBuilders] = useState(null);
  // const [isLoading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch("https://buidlguidl-v3.ew.r.appspot.com/builders")
  //     .then(res => res.json())
  //     .then(data => {
  //       setBuilders(data);
  //       setLoading(false);
  //     });
  // }, []);

  // if (isLoading) return <p>Loading...</p>;
  // if (!builders) return <p>No profile data</p>;

  useEffect(() => {
    setUpExtensionAvailable(!!window.lukso);
  }, []);

  return (
    <>
      <MetaHeader />

      {!account.isConnected ? (
        <ConnectWalletDisplay />
      ) : (
        <div className="flex items-center flex-col flex-grow py-14">
          <div className="text-center mb-8">
            <h3 className="text-4xl font-bold mb-4">Set up your upDev account</h3>
            <p className="my-0 text-lg">Complete 3 steps to onboard to the dApp</p>
          </div>

          {!upConnected ? (
            <ConnectUniversalProfileDisplay
              upExtensionAvailable={upExtensionAvailable}
              setUpConnected={setUpConnected}
            />
          ) : (
            // TODO <ConnectAccountsDisplay />
            <DeployUPDisplay />
          )}
        </div>
      )}
    </>
  );
};

export default Home;
