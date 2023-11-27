import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components/updev/";
import { ConnectUniversalProfile } from "~~/components/updev/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const account = useAccount();
  const router = useRouter();

  const { data: profile } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (account.isConnected && !isLoading) {
      const hasDeployedUP = profile && profile[0] != "0x0000000000000000000000000000000000000000";
      if (!hasDeployedUP) {
        router.push("/onboarding");
      } else {
        router.push("/profile/" + profile[2]);
      }
    }
  }, [account.isConnected, router, profile, isLoading]);

  return (
    <>
      <MetaHeader />

      {!account.isConnected ? (
        <LandingDisplay />
      ) : (
        <>
          {isLoading || profile ? (
            <div className="grow flex flex-col justify-center items-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="flex items-center flex-col flex-grow py-28">
              <ConnectUniversalProfile />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Home;
