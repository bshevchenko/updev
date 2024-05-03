import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components";
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

  useEffect(() => {
    const hasDeployedUP = up && up != "0x0000000000000000000000000000000000000000";
    if (account.isConnected) {
      router.push("/onboarding");
      // if (!hasDeployedUP) { // TODO uncomment
      //   router.push("/onboarding");
      // } else {
      //   router.push("/profile/" + up);
      // }
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
