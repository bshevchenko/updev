import popupCenter from "../popupCenter";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";

export function OAuthStep() {
  return (
    <>
      <OnboardProgressIndicator completedSteps={0} />

      <h1>TODO OAuth in Modal window</h1>
      <br/>

      <button className="btn btn-secondary" onClick={() => popupCenter("/oauth/twitter", "Twitter Sign In")}>
        Continue with Twitter
      </button>
      <br />
      <button className="btn btn-secondary" onClick={() => popupCenter("/oauth/github", "GitHub Sign In")}>
        Continue with GitHub
      </button>
    </>
  );
}
