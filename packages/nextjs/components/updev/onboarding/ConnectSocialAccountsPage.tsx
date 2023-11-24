import { ConnectSocialAccounts } from "../ConnectSocialAccounts";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function ConnectSocialAccountsPage() {
  return (
    <>
      <OnboardProgressIndicator currentStep={2} />
      <div className="max-w-4xl">
        <ConnectSocialAccounts />
      </div>
    </>
  );
}
