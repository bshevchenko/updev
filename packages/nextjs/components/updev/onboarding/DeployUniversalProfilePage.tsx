import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function DeployUniversalProfilePage({
  setCurrentStep,
  setUpConnected,
}: {
  setCurrentStep: any;
  setUpConnected: any;
}) {
  return (
    <>
      <OnboardProgressIndicator completedSteps={1} />
      <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-[850px]">
        <div className="text-center">
          TODO Display Selected Profile
          <br />
          <br />
          TODO Back button to reselect UP
          <br />
          <br />
          TODO hints: we need UP on Mumbai Testnet to access Chainlink Functions, LSP23 same address, LSP24 references
          <br />
          <br />
          TODO Deploy Universal Profile (LSP23) to Mumbai Testnet if not already deployed
          <br />
          <br />
          TODO LSP24 references
          <br />
          <br />
          TODO Link to Mumbai Faucet
        </div>
      </div>
      <button
        className="btn border-white hover:border-accent fixed bottom-10 right-44 w-[128px]"
        onClick={() => {
          setUpConnected(false);
          setCurrentStep(1);
        }}
      >
        <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
        Back
      </button>

      <button className="btn btn-primary fixed bottom-10 right-9 w-[128px]" onClick={() => setCurrentStep(3)}>
        Next
        <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
      </button>
    </>
  );
}