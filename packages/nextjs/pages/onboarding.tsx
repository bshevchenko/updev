import { ReactElement, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import { MetaHeader } from "~~/components/MetaHeader";
import {
  DeployStep,
  OAuthStep,
} from "~~/components/onboarding";
import Layout from "~~/components/layout";
import { NextPageWithLayout } from "./_app";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Onboarding: NextPageWithLayout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: session } = useSession();
  const account = useAccount();
  const router = useRouter();

  const { data: up } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  useEffect(() => {
    if (up && up != "0x0000000000000000000000000000000000000000") {
      router.push("/profile/" + up);
    }
  }, [account.isConnected, router, up]);

  useEffect(() => {
    console.log("SESSION", session);
    if (session && new Date(session.expires) > new Date()) {
      setCurrentStep(2);
    }
  }, [session]);

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
            {currentStep === 1 && <OAuthStep />}
            {currentStep === 2 && <DeployStep setCurrentStep={setCurrentStep} />}
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

Onboarding.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default Onboarding;
