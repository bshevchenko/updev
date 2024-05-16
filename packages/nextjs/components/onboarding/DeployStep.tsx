import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { signMessage } from "@wagmi/core";
import { useAccount } from "wagmi";
import { utils } from "ethers";

// TODO replace type with Profile object?
export function DeployStep({ setCurrentStep, profile }: { setCurrentStep: any, profile: any }) {
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: session } = useSession();
  const account = useAccount();

  useEffect(() => {
    console.log("PROFILE", profile);
  }, [profile]);

  async function handleDeploy() {
    if (!session || !session.user) {
      return;
    }
    setIsDeploying(true);
    try {
      const token = session.account.access_token;
      const id = session.account.providerAccountId;
      const message = utils.keccak256(utils.toUtf8Bytes(token + id));
      const signature = await signMessage({ message }); // TODO setIsSigning(true)
      const result = await axios.post("/api/sign-up", {
        controller: account.address,
        signature,
        name: profile.name,
        description: profile.description,
        location: profile.location,
        isCompany: profile.isCompany,
        provider: session.account.provider,
        token,
        id,
        image: session.user.image
      });
      console.log("API Result", result.data);
      setIsDeploying(false);
      // TODO mint batch interests tokens
      // setCurrentStep(3); TODO
    } catch (e) {
      console.error("Deploying error", e);
      setIsDeploying(false);
    }
  }
  if (!session || !session.user) {
    return (<></>);
  }
  return (
    <>
      <OnboardProgressIndicator progress="75%" />
      <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-96">
        <div className="flex justify-center items-center gap-4">
            <div className="rounded-full overflow-hidden">
              <Image
                alt="userpic"
                width={48}
                height={48}
                src={session.user.image || ""}
              />
            </div>
            <div className="text-xl">
              Hey, <b>{session.user.name}</b><br />
              {profile.type}
            </div>
          </div>
        <div className="mt-5 text-center">
          <button onClick={() => handleDeploy()} className="btn btn-primary py-0 text-md" disabled={isDeploying}>
            {isDeploying ? (
              "Deploying..."
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
