import { AuthDataValidator, objectToAuthDataMap } from "@telegram-auth/server";
import CredentialsProvider from "next-auth/providers/credentials";

const telegram = () =>
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
      const hash = authData.get("hash") || "";
      authData.delete("hash");

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
            dataStr,
          },
          name: [user.first_name, user.last_name || ""].join(" "),
          image: user.photo_url,
        };
        return returned;
      }
      return null;
    },
  });

export default telegram;
