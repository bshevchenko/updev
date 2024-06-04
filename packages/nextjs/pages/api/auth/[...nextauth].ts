import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import InstagramProvider from "next-auth/providers/instagram";
import LinkedinProvider from "next-auth/providers/linkedin";
import DiscordProvider from "~~/providers/discord";
// import TelegramProvider from "~~/providers/telegram";
import TwitterProvider from "~~/providers/twitter";

// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import clientPromise from "~~/lib/db/clientPromise";

export default NextAuth({
  // adapter: MongoDBAdapter(clientPromise),
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
    }),
    DiscordProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    }),
    LinkedinProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      client: { token_endpoint_auth_method: "client_secret_post" },
      issuer: "https://www.linkedin.com",
      profile: (profile: any) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    }),
    // TelegramProvider(),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.account = token.account; // @ts-ignore
      session.profile = token.profile;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.account = account;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },
    async redirect({ url }) {
      return url;
    },
  },
  pages: {
    signIn: "/oauth/signIn",
    signOut: undefined,
    error: undefined, // Error code passed in query string as ?error=
    verifyRequest: undefined, // (used for check email message)
    newUser: undefined, // New users will be directed here on first sign in (leave the property out if not of interest)
  },
});
