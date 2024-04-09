import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import InstagramProvider from "next-auth/providers/instagram";
import TwitterProvider from "next-auth/providers/twitter";

// TODO typescript
export default NextAuth({
  secret: process.env.SECRET,
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // console.log('session', session, token, user);
      // @ts-ignore
      session.user.id = token.id; // @ts-ignore
      session.accessToken = token.accessToken; // @ts-ignore
      session.provider = token.provider;
      return session;
    },
    async jwt({ token, account, user }) {
      // console.log('jwt 23 NEW', token, account, user);
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async redirect({ url }) {
      return url;
    },
  },
});
