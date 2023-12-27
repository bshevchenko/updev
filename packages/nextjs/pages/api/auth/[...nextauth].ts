import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import InstagramProvider from "next-auth/providers/instagram";
import TwitterProvider from "next-auth/providers/twitter";

// TODO typescript
export default NextAuth({
  providers: [
    GithubProvider({
      // @ts-ignore
      clientId: process.env.GITHUB_ID, // @ts-ignore
      clientSecret: process.env.GITHUB_SECRET,
    }),
    TwitterProvider({
      // @ts-ignore
      clientId: process.env.TWITTER_CLIENT_ID, // @ts-ignore
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.user.id = token.id; // @ts-ignore
      session.accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
});
