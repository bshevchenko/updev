import { ConnectSocialAccounts } from "../ConnectSocialAccounts";
import { StepsProgress } from "./StepsProgress";

export function ConnectSocialAccountsPage() {
  return (
    <>
      <StepsProgress currentStep={2} />
      <ConnectSocialAccounts />
    </>
  );
}
