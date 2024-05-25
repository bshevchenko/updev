import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import TwitterProvider from "next-auth/providers/twitter";
import { TwitterLegacyProfile, TwitterProfile } from "next-auth/providers/twitter";

export default function Twitter<P extends Record<string, any> = TwitterLegacyProfile | TwitterProfile>(
  options: OAuthUserConfig<P>,
): OAuthConfig<P> {
  if (options.version === "2.0") {
    const result = TwitterProvider(options); // @ts-ignore
    result.userinfo.params = {
      "user.fields": "profile_image_url,description,location",
    };
    result.profile = function ({ data }) {
      return {
        id: data.id,
        name: data.name,
        // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
        email: null,
        image: data.profile_image_url.replace("_normal", ""),
      };
    };
    return result;
  }
  throw new Error("version not supported");
}
