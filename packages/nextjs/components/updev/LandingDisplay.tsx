import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ReactTyped from "react-typed";

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

        <div className="absolute -bottom-20 text-3xl">
          <ReactTyped
            strings={["A Web3 Resume   ", "A Multi-Chain First    ", "Powered by : LUKSO, Polygon, and Chainlink"]}
            typeSpeed={100}
            loop
            backSpeed={20}
            cursorChar="🆙"
            showCursor={true}
          />
          <div>{/* <b>TODO Move here supported browsers and Powered by LUKSO ?</b> */}</div>
        </div>
        <div className="absolute right-10 -bottom-60">
          <Image alt="pattern right" width={700} height={700} src="/pattern-right.svg" />
        </div>
      </div>
    </div>
  );
}
