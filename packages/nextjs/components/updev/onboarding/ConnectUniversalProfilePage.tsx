import { ConnectUniversalProfile } from "../ConnectUniversalProfile";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function ConnectUniversalProfilePage({
  upExtensionAvailable,
  setUpConnected,
}: {
  upExtensionAvailable: boolean;
  setUpConnected: any;
}) {
  return (
    <>
      <OnboardProgressIndicator currentStep={0} />
      <ConnectUniversalProfile upExtensionAvailable={upExtensionAvailable} setUpConnected={setUpConnected} />
    </>
  );
}
