import { ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ProfileCard } from "~~/components";
import Layout from "~~/components/layout";
import { NextPageWithLayout } from "~~/pages/_app";

const Profiles: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);

  const fetchProfiles = () => {
    console.log("Fetching tokens...");
    setIsLoading(true);
    axios.get("/api/profiles").then(result => {
      setProfiles(result.data);
      console.log(result.data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div className="px-5 md:px-10 lg:px-20 py-20">
      <div className="flex justify-center items-center mb-20 gap-4">
        <h1 className="text-center text-5xl mb-0 mt-1 font-bold">Discover Profiles</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {!isLoading &&
          profiles.map((profile: any) => (
            <Link href={`/profile/${profile.up}`} key={profile.up}>
              <ProfileCard upAddress={profile.up} />
            </Link>
          ))}
      </div>
    </div>
  );
};

Profiles.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profiles;
