import type { NextPage } from "next";

// TODO

const Profiles: NextPage = () => {
  return (
    <div className="px-5 md:px-10 lg:px-20 py-20">
      <div className="flex justify-center items-center mb-20 gap-4">
        <h1 className="text-center text-5xl mb-0 mt-1 font-bold">Discover Profiles</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        TODO
        {/* {verifiedProfiles &&
          verifiedProfiles.map((profile: upRegistryProfile) => (
            <Link href={`/profile/${profile.up}`} key={profile.upLukso}>
              <ProfileCard upAddress={profile.upLukso} />
            </Link>
          ))} */}
      </div>
    </div>
  );
};

export default Profiles;
