import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function OAuthStep({ setCurrentStep }: { setCurrentStep: any }) {
  // const { data: session } = useSession();

  // useEffect(() => {
  //   console.log("SESSION", session);
  //   if (session && new Date(session.expires) > new Date()) {
  //     setCurrentStep(2);
  //   }
  // }, [session]);

  return (
    <>
      <OnboardProgressIndicator completedSteps={0} />

      <button className="btn btn-secondary" onClick={() => signIn("twitter")}>
        Continue with Twitter
      </button>
      <br />
      <button className="btn btn-secondary" onClick={() => signIn("github")}>
        Continue with GitHub
      </button>
    </>
  );
}
