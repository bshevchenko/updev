import { ConnectUniversalProfile } from "../ConnectUniversalProfile";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function ConnectUniversalProfileStep({
  upExtensionAvailable,
  setUpConnected,
}: {
  upExtensionAvailable: boolean;
  setUpConnected: any;
}) {
  return (
    <>
      <OnboardProgressIndicator completedSteps={0} />
      <ConnectUniversalProfile upExtensionAvailable={upExtensionAvailable} setUpConnected={setUpConnected} />
    </>
  );
}
