import Image from "next/image";
import Link from "next/link";
import { ConnectSocialAccounts } from "../ConnectSocialAccounts";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function ConnectSocialAccountsStep({ setCurrentStep }: { setCurrentStep: any }) {
  return (
    <>
      <OnboardProgressIndicator completedSteps={2} />
      <div className="max-w-4xl">
        <ConnectSocialAccounts />

        <button
          className="btn border-white hover:border-accent fixed bottom-10 right-44 w-[128px]"
          onClick={() => setCurrentStep(2)}
        >
          <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
          Back
        </button>
        <Link href="/profile" className="btn btn-primary fixed bottom-10 right-9 w-[128px]">
          Next
          <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
        </Link>
      </div>
    </>
  );
}
