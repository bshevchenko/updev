import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import {
  DeployUniversalProfileStep,
  OAuthStep,
} from "~~/components/updev/onboarding/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import type { NextPage } from "next";

const Onboarding: NextPage = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const account = useAccount(); // EOA connected to rainbow kit
  const router = useRouter();
  const { data: session } = useSession();

  const { data: up } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  useEffect(() => {
    console.log("SESSION", session);
    if (session && new Date(session.expires) > new Date()) {
      setCurrentStep(2);
    }
  }, [session]);

  useEffect(() => {
    // if (!account.isConnected) { // TODO
    //   router.push("/");
    //   return;
    // }
    if (up && up != "0x0000000000000000000000000000000000000000") {
      // setCurrentStep(3); // TODO mint first Account NFT
      router.push("/profile/" + up);
      return;
    }
  }, [account.isConnected, router, up, currentStep]);

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow py-14">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold mb-4">Set up your upDev account</h3>
          <p className="my-0 text-lg">Complete 3 steps to onboard to the dApp</p>
        </div>

        {session !== undefined ? (
          <>
            {currentStep === 1 && <OAuthStep setCurrentStep={setCurrentStep} />}
            {currentStep === 2 && <DeployUniversalProfileStep setCurrentStep={setCurrentStep} />}
          </>
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

export default Onboarding;
