import { Steps } from "~~/components/updev/";

export default function DeployUPDisplay() {
  return (
    <>
      <Steps currentStep={1} />

      <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-[850px]">
        <div className="text-center">
          TODO hints: we need UP on Mumbai Testnet to access Chainlink Functions, LSP23 same address, LSP24 references
          <br />
          <br />
          TODO Deploy Universal Profile (LSP23) to Mumbai Testnet if not already deployed
          <br />
          <br />
          TODO LSP24 references
        </div>
      </div>
    </>
  );
}
