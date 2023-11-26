import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import {
  ConnectSocialAccountsStep, // TODO
  ConnectUniversalProfileStep,
  DeployUniversalProfileStep,
} from "~~/components/updev/onboarding/";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";

const Onboarding: NextPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { universalProfileData } = useContext(UniversalProfileContext);

  const account = useAccount(); // EOA connected to rainbow kit
  const router = useRouter();

  useEffect(() => {
    if (!account.isConnected) {
      router.push("/");
    }
    if (account.isConnected && universalProfileData.address === "") {
      setCurrentStep(1);
    }
    if (account.isConnected && universalProfileData.address.length > 0) {
      setCurrentStep(2);
    }
  }, [account.isConnected, router, universalProfileData]);

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow py-14">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold mb-4">Set up your upDev account</h3>
          <p className="my-0 text-lg">Complete 3 steps to onboard to the dApp</p>
        </div>

        {currentStep === 1 && <ConnectUniversalProfileStep />}

        {currentStep === 2 && <DeployUniversalProfileStep setCurrentStep={setCurrentStep} />}

        {currentStep === 3 && <ConnectSocialAccountsStep setCurrentStep={setCurrentStep} />}
      </div>
    </>
  );
};

export default Onboarding;
