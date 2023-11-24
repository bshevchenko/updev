import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function DeployUniversalProfilePage() {
  return (
    <>
      <OnboardProgressIndicator currentStep={1} />
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
    </>
  );
}
