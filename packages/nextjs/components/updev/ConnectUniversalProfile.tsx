import { useContext } from "react";
import Image from "next/image";
import { UniversalProfileContext } from "~~/providers/UniversalProfile";

export function ConnectUniversalProfile({
  setUpConnected,
  upExtensionAvailable,
}: {
  upExtensionAvailable: boolean;
  setUpConnected: any;
}) {
  const { universalProfileData, setUniversalProfileData } = useContext(UniversalProfileContext);

  async function connectUniversalProfile() {
    if (window.lukso) {
      try {
        const accounts = await window.lukso.request({ method: "eth_requestAccounts" });
        setUpConnected(true);

        setUniversalProfileData({
          ...universalProfileData,
          address: accounts[0],
        });
        console.log("accounts", accounts);
      } catch (error) {
        console.error("Error connectinng to LUKSO", error);
      }
    }
  }

  if (!universalProfileData) <span className="loading loading-spinner loading-lg"></span>;

  return (
    <div className="bg-base-100 border border-base-200 p-8 rounded-lg w-[336px]">
      {universalProfileData?.address === "" ? (
        <>
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <Image alt="upDev logo" width={56} height={56} src="/up.png" />
            </div>
            <h5 className="text-xl font-bold">Universal Profiles</h5>
            <p className="text-sm">TODO hints: why connect with UPE too, following UP Mumbai deployment</p>
          </div>
          <div className="mb-20 text-center">
            {upExtensionAvailable ? (
              <button onClick={() => connectUniversalProfile()} className="btn btn-primary py-0 text-md">
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
            <div className="flex gap-1">
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
        </>
      ) : (
        <div>
          <h3>Universal Profile</h3>
          <p>Connected as</p>
          <p>{universalProfileData?.address}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setUniversalProfileData({ address: "" });
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
