import { useEffect, useRef, useState } from "react";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { signMessage } from "@wagmi/core";
import axios from "axios";
import crypto from "crypto";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

// TODO replace type with Profile object?
export function DeployStep({ setCurrentStep, profile }: { setCurrentStep: any; profile: any }) {
  const [, setIsDeploying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const { data: session } = useSession();
  const account = useAccount();

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      console.log("PROFILE", profile);
      handleDeploy();
    }
  }, [profile]);

  async function handleDeploy() {
    console.log("Signing...");
    if (!session || !session.user) {
      return;
    }
    setIsSigning(true);
    try {
      // @ts-ignore
      const token = session.account.access_token; // @ts-ignore
      const id = session.account.providerAccountId;
      const message = token + id;
      const signature = await signMessage({ message: crypto.createHash("md5").update(message).digest("hex") });
      setIsSigning(false);
      setIsDeploying(true);
      const result = await axios.post("/api/sign-up", {
        controller: account.address,
        signature,
        name: profile.name,
        description: profile.description,
        location: profile.location || "",
        isCompany: profile.isCompany, // @ts-ignore
        provider: session.account.provider,
        token,
        id,
        image: session.user.image,
      });
      console.log("API Result", result.data);
      setIsDeploying(false);
      toast.success("Your profile has been successfully created! Verifying your very first account...");
      // router.push("/profile/" + result.data.up);
    } catch (e: any) {
      if (!e.message.includes("User rejected")) {
        toast.error(e.message);
      } else {
        toast.error("You rejected the signature request.");
      }
      setCurrentStep(3);
      console.error("Deploying error", e);
      setIsDeploying(false);
      setIsSigning(false);
    }
  }
  if (!session || !session.user) {
    return <></>;
  }
  return (
    <>
      <OnboardProgressIndicator progress="90%" />
      <div className="w-96">
        <div className="text-xl font-semibold mt-10">
          {isSigning ? "Requesting your signature..." : "Creating your profile..."}
        </div>
        <div className="flex items-center text-l text-gray-400 mb-5 mt-2">
          {isSigning
            ? "Please sign a verification message in your wallet."
            : "Please wait a bit while we are creating your profile and minting your very first account."}
        </div>
        <div className="grow flex flex-col justify-center items-center mt-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    </>
  );
}
