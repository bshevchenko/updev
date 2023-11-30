import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components/updev/";
import { ConnectUniversalProfile } from "~~/components/updev/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import Profile from "~~/types/Profile";

const Home: NextPage = () => {
  const account = useAccount();
  const router = useRouter();

  const { data: _profile } = useScaffoldContractRead({
    contractName: "upRegistry", // @ts-ignore
    functionName: "upByEOA",
    args: [account.address],
  }); // @ts-ignore
  const profile: Profile | undefined = _profile;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (account.isConnected && !isLoading) {
      const hasDeployedUP = profile && profile.up != "0x0000000000000000000000000000000000000000";
      console.log("profile", profile);
      console.log("hasDeployedUP", hasDeployedUP);
      if (!hasDeployedUP) {
        router.push("/onboarding");
      } else {
        router.push("/profile/" + profile.up);
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
