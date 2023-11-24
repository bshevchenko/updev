import { ConnectUniversalProfile } from "../ConnectUniversalProfile";
import { StepsProgress } from "./StepsProgress";

export function ConnectUniversalProfilePage({
  upExtensionAvailable,
  setUpConnected,
}: {
  upExtensionAvailable: boolean;
  setUpConnected: any;
}) {
  return (
    <>
      <StepsProgress currentStep={0} />
      <ConnectUniversalProfile upExtensionAvailable={upExtensionAvailable} setUpConnected={setUpConnected} />
    </>
  );
}
