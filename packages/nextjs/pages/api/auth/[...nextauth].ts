import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";
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
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {}, // @ts-ignore
      async authorize(credentials, req) {
        const validator = new AuthDataValidator({
          botToken: `${process.env.TELEGRAM_BOT_TOKEN}`,
        });

        const data = objectToAuthDataMap(req.query || {});
        const user = await validator.validate(data);

        const authData = new Map(data);
        const hash = authData.get('hash') || '';
        authData.delete('hash');

        const dataToCheck: Array<string> = [];
        for (const [key, value] of authData.entries()) {
          dataToCheck.push(`${key}=${value}`);
        }
        dataToCheck.sort();
        const dataStr = dataToCheck.join(`\n`);

        if (user.id && user.first_name) {
          const returned = {
            id: user.id.toString(),
            email: {
              hash,
              dataStr
            },
            name: [user.first_name, user.last_name || ""].join(" "),
            image: user.photo_url
          }
          return returned;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      session.account = token.account // @ts-ignore
      session.profile = token.profile
      return session
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.account = account
      }
      if (profile) {
        token.profile = profile
      }
      return token
    },
    async redirect({ url }) {
      return url;
    },
  },
});
