import { useSession } from "next-auth/react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { useEffect } from "react";
import useBio from "~~/hooks/useBio";
import useLocation from "~~/hooks/useLocation";

export function DetailsStep({ setCurrentStep, profile, updateProfile }: { setCurrentStep: any, profile: any, updateProfile: any }) {
  const { data: session } = useSession();
  if (!session || !session.user) {
    return (<></>);
  }
  const bio = useBio();
  const location = useLocation();
  useEffect(() => {
    if (profile.name === undefined) {
      updateProfile("name", session.user.name)
    }
    if (profile.description === undefined) {
      updateProfile("description", bio)
    }
    if (profile.location === undefined) {
      updateProfile("location", location)
    }
  }, [profile])
  useEffect(() => { // TODO remove
    console.log("SESSION", session);
  }, [session])
  return (
    <>
      <OnboardProgressIndicator progress="50%" />
      <div className="w-96">
        <div className="text-xl font-semibold mt-10">
          Edit your profile details
        </div>
        <div className="text-l text-gray-400 mb-5 mt-2">
          {profile.isCompany ? "Company" : "Personal"}. Lorem ipsum dolor sit amet consectetur. Euismod tempor non metus tortor pulvinar nibh.
        </div>
        <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden mb-10">
          <Image
            alt="userpic"
            width={128}
            height={128}
            src={session.user.image || ""}
          />
        </div>
        <div>
          Name
          <input className="bg-black text-white p-2 border border-white rounded-md w-full" type="text" name="name" value={profile.name} />
        </div>
        <div className="mt-4">
          Bio
          <textarea className="bg-black text-white p-2 border border-white rounded-md w-full h-24" name="description" value={profile.description} />
        </div>
        <div className="mt-4">
          Location
          <input className="bg-black text-white p-2 border border-white rounded-md w-full" type="text" name="location" value={profile.location} />
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <button
          className="btn text-green-400 hover:border-accent mr-52"
          onClick={() => {
            setCurrentStep(2)
          }}
        >
          <Image alt="arrow" width={12} height={10} src="/left-arrow.svg" />
          Back
        </button>
        <button
          className="btn bg-green-400 text-black hover:bg-green-500"
          onClick={() => {
            setCurrentStep(4)
          }}
        >
          Next
          <Image alt="arrow" width={12} height={10} src="/right-arrow.svg" />
        </button>
      </div>
    </>
  );
}
