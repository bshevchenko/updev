import { useSession } from 'next-auth/react';

const useUsername = () => {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }
    switch (session.account.provider) { // TODO extract?
        case "github":
            return "@" + session.profile.login
        case "google":
            return session.profile.email
        case "discord":
            return "@" + session.profile.username
        case "twitter":
            return "@" + session.profile.data.username
        default:
            return null;
    }
};

export default useUsername;