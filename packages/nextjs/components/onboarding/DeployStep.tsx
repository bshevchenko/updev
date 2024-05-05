import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { useEthersSigner } from "~~/hooks/scaffold-eth/useEthersSigner";

export function DeployStep({ setCurrentStep }: { setCurrentStep: any }) {
  const signer = useEthersSigner();
  const [isDeploying, setIsDeploying] = useState(false);

  const { data: session } = useSession();

  async function handleDeploy() {
    if (!signer) {
      return;
    }
    if (!session || !session.user) {
      return;
    }
    setIsDeploying(true);
    try {
      const signature = await signer.signMessage(session.account.access_token);
      const result = await axios.post("/api/sign-up", {
        controller: signer._address,
        signature,
        name: session.user.name, // TODO
        description: "Boris has more than 15 years of full-stack software architecture and development experience at high-tech startups and DeFi, DAO dApps/projects.",
        location: "Koh Phangan, Thailand",
        isCompany: false,
        provider: session.account.provider,
        token: session.account.access_token,
        id: session.account.providerAccountId,
        image: session.user.image
      });
      console.log("API Result", result.data);
      setIsDeploying(false);
      // setCurrentStep(3); TODO
    } catch (e) {
      console.error("Deploying error", e);
      setIsDeploying(false);
    }
  }
  if (!session || !session.user) {
    return;
  }
  return (
    <>
      <OnboardProgressIndicator completedSteps={1} />
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
              Hey, <b>{session.user.name}</b>
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
      <button
        className="btn border-white hover:border-accent fixed bottom-10 right-9 w-[128px]"
        onClick={() => {
          signOut();
        }}
        disabled={isDeploying}
      >
        <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
        Back
      </button>
    </>
  );
}
