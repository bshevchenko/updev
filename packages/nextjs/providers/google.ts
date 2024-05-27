import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { GoogleProfile } from "next-auth/providers/google";
import GoogleProvider from "next-auth/providers/google";

export default function Google<P extends GoogleProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  const result = GoogleProvider(options);
  // result.userinfo = {
  //     url: "https://www.googleapis.com/oauth2/v2/userinfo?alt=json", // TODO use v2 in source code if OK
  // };
  return result;
}
