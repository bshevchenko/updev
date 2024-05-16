import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import useUsername from "~~/hooks/useUsername";
import { useState } from "react";

export function TypeStep({ setCurrentStep, setType, type }: { setCurrentStep: any, setType: any, type: any }) {
  const { data: session } = useSession();
  if (!session || !session.user) {
    return (<></>);
  }
  const username = useUsername();

  const handleOptionChange = (e: any) => {
    setType(e.target.value);
  }

  const [isLoading, setIsLoading] = useState(false);
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="grow flex flex-col justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  return (
    <>
      <OnboardProgressIndicator progress={"25%"} />
      <div className="p-8 w-96">
        <div className="text-xl font-bold mb-2">Hey,</div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
            <Image
              alt="userpic"
              width={48}
              height={48}
              src={session.user.image || ""}
            />
          </div>
          <div className="text-xl">
            <b>{session.user.name}</b><br />
            {username && (<b className="text-green-500 font-normal">{username}</b>)}
          </div>
        </div>
        <div className="text-xl font-semibold mt-10 mb-5">What type of profile are you going to register?</div>
        <div className="p-5">
          <input
            type="radio"
            id="personal"
            value="personal"
            checked={type === "personal"}
            onChange={handleOptionChange}
            className="mr-1"
          />
          <label htmlFor="personal">Personal</label>
        </div>
        <div className="p-5">
          <input
            type="radio"
            id="company"
            value="company"
            checked={type === "company"}
            onChange={handleOptionChange}
            className="mr-1"
          />
          <label htmlFor="company">Company</label>
        </div>
      </div>
      <button
        className="btn text-green-400 hover:border-accent fixed bottom-10 left-[31.5%]"
        onClick={() => {
          setIsLoading(true);
          signOut({ redirect: false }).then(() => {
            setIsLoading(false);
            setCurrentStep(1)
          })
        }}
      >
        <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
        Back
      </button>
      <button
        className="btn bg-green-400 text-black hover:bg-green-500 fixed bottom-10 right-9 right-[31.5%]"
        onClick={() => {
          setCurrentStep(3)
        }}
      >
        Next
        <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
      </button>
    </>
  );
}
