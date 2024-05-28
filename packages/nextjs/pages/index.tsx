import { useEffect } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { LandingDisplay } from "~~/components";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const account = useAccount();
  const router = useRouter();

  const { data: up } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  useEffect(() => {
    if (up === undefined) {
      return;
    }
    const hasDeployedUP = up != "0x0000000000000000000000000000000000000000";
    if (account.isConnected) {
      if (!hasDeployedUP) {
        router.push("/onboarding");
      } else {
        router.push("/profile/" + up);
      }
    }
  }, [account.isConnected, router, up]);

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col min-h-screen">
        {!account.isConnected ? (
          <LandingDisplay />
        ) : (
          <>
            <div className="grow flex flex-col justify-center items-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
