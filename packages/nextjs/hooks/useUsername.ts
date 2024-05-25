import { useSession } from "next-auth/react";

const useUsername = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }
  switch (
    // @ts-ignore
    session.account.provider // TODO extract?
  ) {
    case "github": // @ts-ignore
      return "@" + session.profile.login;
    case "google": // @ts-ignore
      return session.profile.email;
    case "discord": // @ts-ignore
      return "@" + session.profile.username;
    case "twitter": // @ts-ignore
      return "@" + session.profile.data.username;
    default:
      return null;
  }
};

export default useUsername;
