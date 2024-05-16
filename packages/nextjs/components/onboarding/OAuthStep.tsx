import toast from "react-hot-toast";
import popupCenter from "../popupCenter";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function OAuthStep({ setCurrentStep }: { setCurrentStep: any }) {
  const { data: session } = useSession();
  useEffect(() => {
    if (session && new Date(session.expires) > new Date()) {
      setCurrentStep(2);
    }
  }, [session]);
  return (
    <>
      <OnboardProgressIndicator progress={"2.5%"} />
      <div className="w-96">
        <div className="text-xl font-semibold mt-10">
          Let’s get started!<br />
          Continue with your existing accounts
        </div>
        <div className="text-l text-gray-400 mb-5 mt-2">
          Lorem ipsum dolor sit amet consectetur. Euismod tempor non metus tortor pulvinar nibh. Euismod sed facilisi praesent dui.
        </div>

        <button className="btn btn-outline w-full mt-4" onClick={() => popupCenter("/oauth/twitter", "Twitter Sign In")}>
          Continue with X (Twitter)
        </button>
        <br />
        <button className="btn btn-outline w-full mt-4" onClick={() => popupCenter("/oauth/github", "GitHub Sign In")}>
          Continue with GitHub
        </button>
        <br />
        <button className="btn btn-outline w-full mt-4" onClick={() => popupCenter("/oauth/discord", "Discord Sign In")}>
          Continue with Discord
        </button>
        <br />
        <button className="btn btn-outline w-full mt-4" onClick={() => popupCenter("/oauth/google", "Google Sign In")}>
          Continue with Google
        </button>

        <div className="text-center mt-10">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            toast("Please contact us and let us know about accounts you have.")
          }} className="text-green-400 hover-underline">I don't have any of these accounts</a>
        </div>

      </div>
    </>
  );
}
