import { useSession } from "next-auth/react";

const useBio = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }
  switch (
    // @ts-ignore
    session.account.provider // TODO extract?
  ) {
    case "github": // @ts-ignore
      return session.profile.bio;
    case "google":
      return "";
    case "discord":
      return "";
    case "twitter": // @ts-ignore
      return session.profile.data.description;
    default:
      return null;
  }
};

export default useBio;
