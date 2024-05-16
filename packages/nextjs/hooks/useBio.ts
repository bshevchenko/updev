import { useSession } from 'next-auth/react';

const useBio = () => {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }
    switch (session.account.provider) { // TODO extract?
        case "github":
            return session.profile.bio
        case "google":
            return ""
        case "discord":
            return ""
        case "twitter":
            return session.profile.data.description
        default:
            return null;
    }
};

export default useBio;