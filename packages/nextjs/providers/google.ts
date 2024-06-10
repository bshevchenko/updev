import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { GoogleProfile } from "next-auth/providers/google";

export default function Google<P extends GoogleProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  return {
    id: "google",
    name: "Google",
    type: "oauth",
    wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
    authorization: { params: { scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly" } },
    idToken: true,
    checks: ["pkce", "state"],
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
    style: { logo: "/google.svg", bg: "#fff", text: "#000" },
    options,
  };
}
