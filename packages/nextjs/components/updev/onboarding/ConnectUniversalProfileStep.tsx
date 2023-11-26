import { ConnectUniversalProfile } from "../ConnectUniversalProfile";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function ConnectUniversalProfileStep() {
  return (
    <>
      <OnboardProgressIndicator completedSteps={0} />
      <ConnectUniversalProfile />
    </>
  );
}
