import { useSession } from 'next-auth/react';

const useLocation = () => {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }
    switch (session.account.provider) { // TODO extract?
        case "github":
            return session.profile.location
        case "google":
            return ""
        case "discord":
            return ""
        case "twitter":
            return session.profile.data.location
        default:
            return null;
    }
};

export default useLocation;