import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function LandingDisplay() {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="flex grow flex-col justify-center">
      <div className="flex flex-col items-center justify-center gap-14 relative">
        <div className="absolute left-10 -top-60">
          <Image alt="pattern left" width={700} height={700} src="/pattern-left.svg" />
        </div>
        <div className="flex flex-col items-center ">
          <div className="w-56 mb-5">
            <Image alt="upDev logo" width={400} height={200} src="/logo.svg" />
          </div>
          <div className="badge badge-outline badge-accent rounded-sm px-0.5 border-2 font-bold">BETA V1.0</div>
        </div>
        <div className="text-center">
          <h3 className="text-white text-5xl">Your universal dev profile on LUKSO</h3>
        </div>

        <div>
          <button className="btn btn-accent px-6 capitalize" onClick={openConnectModal} type="button">
            Connect Wallet
          </button>
        </div>

        <div className="w-1/2 remove-me-later text-center">
          <div>
            <b>TODO Short description of features. multi-chain dapp</b>
          </div>
          <h4 className="text-white mt-5">
            &nbsp; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
            ex ea commodo consequat.
          </h4>
          <div>
            <b>TODO Move here supported browsers and Powered by LUKSO ?</b>
          </div>
        </div>
        <div className="absolute right-10 -bottom-60">
          <Image alt="pattern right" width={700} height={700} src="/pattern-right.svg" />
        </div>
      </div>
    </div>
  );
}
