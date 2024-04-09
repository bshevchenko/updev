import { signIn } from "next-auth/react";

const SignInPage = () => {
  // const { data: session, status } = useSession();

  void signIn("twitter");

  // useEffect(() => {

  //     // TODO
  //     // if (!(status === "loading") && !session) void signIn("twitter");
  //     // if (session) window.close();
  // }, [session, status]);
};

export default SignInPage;
