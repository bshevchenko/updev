import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { LandingDisplay } from "~~/components/updev/";
import { ConnectUniversalProfile } from "~~/components/updev/";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";

const Home: NextPage = () => {
  const [hasDeployedUP] = useState(false);

  const { universalProfileData } = useContext(UniversalProfileContext);
  const account = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (account.isConnected && !hasDeployedUP) {
      router.push("/onboarding");
    }
    if (account.isConnected && universalProfileData.address.length > 0 && hasDeployedUP) {
      router.push("/profile");
    }
  }, [account.isConnected, universalProfileData.address.length, router, hasDeployedUP]);

  return (
    <>
      <MetaHeader />

      {!account.isConnected ? (
        <LandingDisplay />
      ) : (
        <div className="flex items-center flex-col flex-grow py-28">
          <ConnectUniversalProfile />
        </div>
      )}
    </>
  );
};

export default Home;
