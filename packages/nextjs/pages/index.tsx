import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components/updev/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const account = useAccount();
  const router = useRouter();

  const { data: up } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasDeployedUP = up && up != "0x0000000000000000000000000000000000000000";
    if (hasDeployedUP) {
      setIsLoading(false);
    }
    if (account.isConnected && !isLoading) {
      if (!hasDeployedUP) {
        router.push("/onboarding");
      } else {
        router.push("/profile/" + up);
      }
    }
  }, [account.isConnected, router, up, isLoading]);

  return (
    <>
      <MetaHeader />

      {!account.isConnected ? (
        <LandingDisplay />
      ) : (
        <>
          <div className="grow flex flex-col justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
