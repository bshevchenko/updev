import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const account = useAccount();

  const [luksoAvailable, setLuksoAvailable] = useState(false);
  const [builders, setBuilders] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLuksoAvailable(!!window.lukso);
  }, []);

  useEffect(() => {
    fetch("https://buidlguidl-v3.ew.r.appspot.com/builders")
      .then(res => res.json())
      .then(data => {
        setBuilders(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!builders) return <p>No profile data</p>;

  console.log(builders);

  async function connect() {
    if (window.lukso) {
      try {
        const accounts = await window.lukso.request({ method: "eth_requestAccounts" });
        console.log("accounts", accounts);
      } catch (error) {
        console.error("Error connectinng to LUKSO", error);
      }
    }
  }

  if (!account.isConnected) {
  }

  return (
    <>
      <MetaHeader />

      {account.isConnected ? (
        <div className="flex items-center flex-col flex-grow py-14 gap-10">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-4">Set up your upDev account</h3>
            <p className="my-0 text-lg">Complete 3 steps to onboard to the dApp</p>
          </div>

          <div className="flex w-[450px] justify-around items-center gap-5">
            <div className="w-6 h-6 border-2 border-accent rounded-full"></div>
            <hr className="border-secondary border grow" />
            <div className="w-6 h-6 border-2 border-[#FFFFFF3D] rounded-full"></div>
            <hr className="border-secondary border grow" />
            <div className="w-6 h-6 border-2 border-secondary rounded-full"></div>
          </div>

          <div className="bg-base-100 border border-base-200 p-7 rounded-lg w-[336px]">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-5">
                <Image alt="upDev logo" width={56} height={56} src="/up.png" />
              </div>
              <h5 className="text-xl font-bold">Universal Profiles</h5>
              <p className="text-sm">Connect to view and send assets from your Universal Profile</p>
            </div>
            <div className="mb-24">
              {luksoAvailable ? (
                <button onClick={() => connect()} className="btn btn-primary py-0 text-md w-full">
                  Connect with Universal Profile
                </button>
              ) : (
                <a
                  className="btn btn-primary w-full"
                  href="https://chromewebstore.google.com/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add Universal Profile Extension
                </a>
              )}
            </div>
            <div className="flex justify-center gap-4 mb-5">
              <div>
                <p className="m-0">Supported browsers</p>
              </div>
              <div className="flex gap-2">
                <Image alt="chrome logo" width={20} height={20} src="/chrome.svg" />
                <Image alt="brave logo" width={24} height={24} src="/brave.svg" />
              </div>
            </div>
            <div className="flex justify-center">
              <div>
                <div className="text-[8px]">Powered by</div>
                <Image alt="upDev logo" width={66} height={14} src="/lukso.svg" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-14 grow">
          <div className="flex flex-col items-center justify-center">
            <div className="w-56 mb-5">
              <Image alt="upDev logo" width={400} height={200} src="/logo.svg" />
            </div>
            <div className="badge badge-outline badge-accent rounded-sm px-0.5 border-2 font-bold">BETA V1.0</div>
          </div>

          <div>
            <h3 className="text-white text-5xl">Your universal dev profile on LUKSO</h3>
          </div>
          <div>
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
