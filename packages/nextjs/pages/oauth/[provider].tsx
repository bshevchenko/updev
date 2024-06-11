import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LoginButton } from "@telegram-auth/react";
import { signIn, useSession } from "next-auth/react";

const Provider = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isTelegram, setIsTelegram] = useState<boolean>(false);

  // @ts-ignore
  const provider = (session && session.account && session.account.provider) || "null";

  useEffect(() => {
    if (!router.query.provider || status == "loading") {
      return;
    }
    if (status == "authenticated" && provider == router.query.provider) {
      window.close();
      router.push("/onboarding");
      return;
    }
    if (router.query.provider != "telegram") {
      void signIn(router.query.provider as string);
    } else {
      setIsTelegram(true);
    }
  }, [session, status, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grow flex flex-col justify-center items-center">
        {!isTelegram ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : (
          <>
            <LoginButton
              botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || ""}
              onAuthCallback={data => {
                signIn("telegram", {}, data as any);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Provider;
