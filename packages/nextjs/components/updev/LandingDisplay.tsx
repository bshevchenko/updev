import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function LandingDisplay() {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="flex flex-col items-center justify-center gap-14 grow">
      <div className="flex justify-start w-full">
        <Image alt="upDev logo" width={700} height={700} src="/horizontal.svg" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-56 mb-5">
          <Image alt="upDev logo" width={400} height={200} src="/logo.svg" />
        </div>
        <div className="badge badge-outline badge-accent rounded-sm px-0.5 border-2 font-bold">BETA V1.0</div>
      </div>
      <div className="text-center w-2/3">
        <h3 className="text-white text-5xl">Your universal dev profile on LUKSO</h3>
        <h4 className="text-white mt-5">
          <b>TODO Short description of features. multi-chain dapp</b>&nbsp; Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </h4>
        TODO Move here supported browsers and Powered by LUKSO ?<br />
        TODO upDev Logo in Favicon
        <br />
        TODO vertical green lines
      </div>
      <div>
        <button className="btn btn-accent px-6 capitalize" onClick={openConnectModal} type="button">
          Connect Wallet
        </button>
      </div>
      <div className="flex justify-end w-full relative">
        {/* <div className="absolute inset-0 flex justify-center items-center"> TODO vertical green lines
            <Image alt="upDev logo" className="z-10" width={150} height={150} src="/vertical.svg" />
          </div> */}
        <Image alt="upDev logo" width={700} height={700} src="/horizontal.svg" />
      </div>
    </div>
  );
}
