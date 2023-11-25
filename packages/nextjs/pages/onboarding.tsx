import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import {
  ConnectSocialAccountsPage, // TODO
  ConnectUniversalProfilePage,
  DeployUniversalProfilePage,
} from "~~/components/updev/onboarding/";

const Onboarding: NextPage = () => {
  const [upExtensionAvailable, setUpExtensionAvailable] = useState(false);
  const [upConnected, setUpConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const account = useAccount();
  const router = useRouter();

  useEffect(() => {
    // console.log("hello from onboarding useEffect");
    // // if (!account.isConnected) {
    // //   router.push("/");
    // // }
    if (account.isConnected && !upConnected) {
      setCurrentStep(1);
    }
    if (account.isConnected && upConnected) {
      setCurrentStep(2);
    }
    // setCurrentStep(3);
  }, [account.isConnected, router, upConnected]);

  useEffect(() => {
    setUpExtensionAvailable(!!window.lukso);
  }, []);

  console.log("onboarding component");
  console.log("upConnected", upConnected);
  console.log("currentStep", currentStep);
  console.log(account.isConnected && upConnected);

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow py-14">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold mb-4">Set up your upDev account</h3>
          <p className="my-0 text-lg">Complete 3 steps to onboard to the dApp</p>
        </div>

        {currentStep === 1 && (
          <ConnectUniversalProfilePage upExtensionAvailable={upExtensionAvailable} setUpConnected={setUpConnected} />
        )}

        {currentStep === 2 && (
          <DeployUniversalProfilePage setCurrentStep={setCurrentStep} setUpConnected={setUpConnected} />
        )}

        {currentStep === 3 && <ConnectSocialAccountsPage setCurrentStep={setCurrentStep} />}
      </div>
    </>
  );
};

export default Onboarding;
