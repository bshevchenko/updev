import Image from "next/image";
import type { NextPage } from "next";
import { ProfileCard } from "~~/components/updev";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Profiles: NextPage = () => {
  const { data: profiles } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "ups",
  });

  return (
    <div className="px-5 md:px-10 lg:px-20">
      <div className="flex justify-center items-center my-20 gap-4">
        <div className="">
          <Image alt="SE2 logo" className="cursor-pointer" width={250} height={250} src="/logo.svg" />
        </div>
        <h1 className="text-center text-5xl mb-0 mt-1 font-bold">Profiles</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {profiles && profiles.map((profile: any) => <ProfileCard key={profile.upLukso} upAddress={profile.upLukso} />)}
      </div>
    </div>
  );
};

export default Profiles;
