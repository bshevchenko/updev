import { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import Layout from "~~/components/layout";
import { DeployStep, OAuthStep, TypeStep } from "~~/components/onboarding";
import { DetailsStep } from "~~/components/onboarding/DetailsStep";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Onboarding: NextPageWithLayout = () => {
  const { status } = useSession();
  const account = useAccount();
  const router = useRouter();

  const defaultProfile = {
    name: undefined,
    description: undefined,
    location: undefined,
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [type, setType] = useState("personal");
  const [profile, setProfile] = useState(defaultProfile);

  const updateProfile = (key: string, newValue: any) => {
    setProfile((prevState: any) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  const updateType = (type: string) => {
    setType(type);
    updateProfile("isCompany", type != "personal");
  };

  const { data: up } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  useEffect(() => {
    if (!account.address) {
      router.push("/");
      return;
    }
    if (up && up != "0x0000000000000000000000000000000000000000") {
      router.push("/profile/" + up);
    }
  }, [status, account.isConnected, router, up, account.address]);

  useEffect(() => {
    if (currentStep === 1) {
      setProfile(defaultProfile);
    }
  }, [currentStep]);

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow py-14">
        {status != "loading" ? (
          <>
            {currentStep === 1 && <OAuthStep setCurrentStep={setCurrentStep} />}
            {currentStep === 2 && <TypeStep setCurrentStep={setCurrentStep} type={type} setType={updateType} />}
            {currentStep === 3 && (
              <DetailsStep setCurrentStep={setCurrentStep} profile={profile} updateProfile={updateProfile} />
            )}
            {currentStep === 4 && <DeployStep setCurrentStep={setCurrentStep} profile={profile} />}
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
  return <Layout>{page}</Layout>;
};

export default Onboarding;
