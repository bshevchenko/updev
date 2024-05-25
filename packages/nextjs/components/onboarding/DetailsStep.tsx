import { useEffect } from "react";
import Image from "next/image";
import { OnboardProgressIndicator } from "./OnboardProgressIndicator";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import useBio from "~~/hooks/useBio";
import useLocation from "~~/hooks/useLocation";

export function DetailsStep({
  setCurrentStep,
  profile,
  updateProfile,
}: {
  setCurrentStep: any;
  profile: any;
  updateProfile: any;
}) {
  const { data: session } = useSession();
  const bio = useBio();
  const location = useLocation();

  useEffect(() => {
    if (profile.name === undefined) {
      // @ts-ignore
      updateProfile("name", session.user.name);
    }
    if (profile.description === undefined) {
      updateProfile("description", bio);
    }
    if (profile.location === undefined) {
      updateProfile("location", location);
    } // @ts-ignore
  }, [profile, bio, location, session?.user.name, updateProfile]);

  const handleChange = (event: any) => {
    updateProfile(event.target.name, event.target.value);
  };

  const handleNextStep = () => {
    let { name, description, location } = profile;
    name = name;
    description = description;
    location = location;
    if (name.length < 3 || name.length > 40) {
      toast.error("Invalid name. Please enter between 3 and 40 characters.");
      return;
    }
    if (description.length < 12 || description.length > 160) {
      toast.error("Invalid description. Please enter between 12 and 160 characters.");
      return;
    }
    if (location.length > 30) {
      toast.error("Invalid location. Please enter maximum 30 characters.");
      return;
    }
    setCurrentStep(4);
  };

  if (!session || !session.user) {
    return <></>;
  }

  return (
    <>
      <OnboardProgressIndicator progress="75%" />
      <div className="w-96">
        <div className="text-xl font-semibold mt-10">
          Edit your {profile.isCompany ? "company" : "personal"} profile details
        </div>
        <div className="flex items-center text-l text-gray-400 mb-5 mt-2">
          <div className="flex-shrink-0 rounded-full overflow-hidden mr-5">
            <Image alt="userpic" width={96} height={96} src={session.user.image || ""} />
          </div>
          {profile.isCompany
            ? "Let others know more about your company! Share its story, values, and what makes it unique."
            : "Let others know more about you! Personalize your profile with information that represents you best."}
        </div>
        <div>
          Name
          <input
            className="bg-black text-white p-2 border border-white rounded-md w-full"
            required
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            minLength={3}
            maxLength={40}
          />
        </div>
        <div className="mt-4">
          Description
          <textarea
            className="bg-black text-white p-2 border border-white rounded-md w-full h-24"
            required
            minLength={12}
            maxLength={160}
            name="description"
            value={profile.description}
            onChange={handleChange}
          />
        </div>
        <div className="mt-4">
          Location
          <input
            className="bg-black text-white p-2 border border-white rounded-md w-full"
            type="text"
            name="location"
            maxLength={30}
            value={profile.location}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <button
          className="btn text-green-400 hover:border-accent mr-52"
          onClick={() => {
            setCurrentStep(2);
          }}
        >
          <Image alt="arrow" width={12} height={10} src="/left-arrow-green.svg" />
          Back
        </button>
        <button
          className="btn bg-green-400 text-black hover:bg-green-500"
          onClick={() => {
            handleNextStep();
          }}
        >
          Submit
        </button>
      </div>
    </>
  );
}
