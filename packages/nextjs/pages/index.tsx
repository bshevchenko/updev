import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components/updev/";
import { ConnectUniversalProfile } from "~~/components/updev/";

const Home: NextPage = () => {
  const account = useAccount();
  const router = useRouter();

  const [upExtensionAvailable, setUpExtensionAvailable] = useState(false);
  const [upConnected, setUpConnected] = useState(false);
  const [hasDeployedUP] = useState(false);

  useEffect(() => {
    setUpExtensionAvailable(!!window.lukso);
  }, []);

  useEffect(() => {
    if (account.isConnected && !hasDeployedUP) {
      router.push("/onboarding");
    }
    if (account.isConnected && upConnected && hasDeployedUP) {
      router.push("/profile");
    }
  }, [account.isConnected, upConnected, router, hasDeployedUP]);

  return (
    <>
      <MetaHeader />

      {!account.isConnected ? (
        <LandingDisplay />
      ) : (
        <div className="flex items-center flex-col flex-grow py-28">
          <ConnectUniversalProfile upExtensionAvailable={upExtensionAvailable} setUpConnected={setUpConnected} />
        </div>
      )}
    </>
  );
};

export default Home;
