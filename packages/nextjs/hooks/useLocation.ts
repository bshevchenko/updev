import { useSession } from "next-auth/react";

const useLocation = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }
  switch (
    // @ts-ignore
    session.account.provider // TODO extract?
  ) {
    case "github": // @ts-ignore
      return session.profile.location;
    case "google":
      return "";
    case "discord":
      return "";
    case "twitter": // @ts-ignore
      return session.profile.data.location;
    default:
      return null;
  }
};

export default useLocation;
