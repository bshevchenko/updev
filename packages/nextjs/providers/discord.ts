import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import DiscordProvider, { DiscordProfile } from "next-auth/providers/discord";

export default function Discord<P extends DiscordProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  const result = DiscordProvider(options);
  result.profile = profile => {
    if (profile.avatar === null) {
      const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
      profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
    } else {
      const format = profile.avatar.startsWith("a_") ? "gif" : "png";
      profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
    }
    return {
      id: profile.id,
      name: profile.global_name || profile.username,
      email: profile.email,
      image: profile.image_url,
    };
  };
  return result;
}
