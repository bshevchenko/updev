import { useState } from "react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { signOut, useSession } from "next-auth/react";
import useUsername from "~~/hooks/useUsername";

export function TypeStep({ setCurrentStep, setType, type }: { setCurrentStep: any; setType: any; type: any }) {
  const { data: session } = useSession();
  const username = useUsername();

  const handleOptionChange = (e: any) => {
    setType(e.target.value);
  };

  const [isLoading, setIsLoading] = useState(false);
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="grow flex flex-col justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!session || !session.user) {
    return <></>;
  }

  return (
    <>
      <OnboardProgressIndicator progress={"50%"} />
      <div className="p-8 w-96">
        <div className="text-xl font-bold mb-2">Hey,</div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
            <Image alt="userpic" width={48} height={48} src={session.user.image || ""} />
          </div>
          <div className="text-xl">
            <b>{session.user.name}</b>
            <br />
            {username && <b className="text-green-400 font-normal">{username}</b>}
          </div>
        </div>
        <div className="text-xl font-semibold mt-10 mb-5">What type of profile are you going to register?</div>
        <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
          <input
            id="personal"
            type="radio"
            value="personal"
            name="bordered-radio"
            onChange={handleOptionChange}
            checked={type === "personal"}
            className="w-5 h-5 form-radio text-green-400 border-green-400 checked:bg-green-400"
          />
          <label htmlFor="personal" className="w-full py-4 ms-2 font-medium text-white text-lg">
            Personal
          </label>
        </div>
        <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700 mt-5">
          <input
            id="company"
            type="radio"
            value="company"
            name="bordered-radio"
            onChange={handleOptionChange}
            checked={type === "company"}
            className="w-5 h-5 form-radio text-green-400 border-green-400 checked:bg-green-400"
          />
          <label htmlFor="company" className="w-full py-4 ms-2 font-medium text-white text-lg">
            Company
          </label>
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <button
          className="btn text-green-400 hover:border-accent mr-52"
          onClick={() => {
            setIsLoading(true);
            signOut({ redirect: false }).then(() => {
              setIsLoading(false);
              setCurrentStep(1);
            });
          }}
        >
          <Image alt="arrow" width={12} height={10} src="/left-arrow-green.svg" />
          Back
        </button>
        <button
          className="btn bg-green-400 text-black hover:bg-green-400"
          onClick={() => {
            setCurrentStep(3);
          }}
        >
          Next
          <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
        </button>
      </div>
    </>
  );
}
