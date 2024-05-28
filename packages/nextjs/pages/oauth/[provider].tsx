import { useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";

const Provider = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // @ts-ignore
  const provider = (session && session.account && session.account.provider) || "null";

  useEffect(() => {
    if (!router.query.provider) {
      return;
    }
    if (status == "authenticated" && provider == router.query.provider) {
      window.close();
      return;
    }
    void signIn(String(router.query.provider));
  }, [session, status, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grow flex flex-col justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
        {status} – {provider} – {router.query.provider}
      </div>
    </div>
  );
};

export default Provider;
