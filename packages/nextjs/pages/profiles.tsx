import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LSP24_SCHEMA_NAME } from "./profile/[address]";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import type { NextPage } from "next";
import lspSchemas from "~~/LSP3ProfileMetadata.json";
import { ProfileCard } from "~~/components/updev";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

type Profile = {
  up: string;
  upLukso: string;
  keyManager: string;
  eoa: string;
};

const Profiles: NextPage = () => {
  const [verifiedProfiles, setVerifiedProfiles] = useState<Profile[] | undefined>(undefined);

  const { data: profiles } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "ups",
  });

  useEffect(() => {
    const checkIfVerified = async (profile: Profile): Promise<boolean> => {
      try {
        const erc725js = new ERC725(lspSchemas as ERC725JSONSchema[], profile.upLukso, "https://rpc.lukso.gateway.fm", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        const lsp24 = await erc725js.fetchData(LSP24_SCHEMA_NAME);
        console.log(lsp24.value, profile.up);
        return lsp24.value === profile.up;
      } catch (error) {
        console.log(error);
        return false;
      }
    };

    const verifyProfiles = async () => {
      if (profiles) {
        const verificationPromises = profiles.map(async profile => {
          const isVerified = await checkIfVerified(profile);
          return { ...profile, isVerified };
        });
        const verifiedResults = await Promise.all(verificationPromises);
        const verifiedProfiles = verifiedResults.filter(profile => profile.isVerified);
        setVerifiedProfiles(verifiedProfiles);
      }
    };

    verifyProfiles();
  }, [profiles]);

  console.log(profiles);

  return (
    <div className="px-5 md:px-10 lg:px-20">
      <div className="flex justify-center items-center my-20 gap-4">
        <div className="">
          <Image alt="SE2 logo" className="cursor-pointer" width={250} height={250} src="/logo.svg" />
        </div>
        <h1 className="text-center text-5xl mb-0 mt-1 font-bold">Profiles</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {verifiedProfiles &&
          verifiedProfiles.map((profile: Profile) => (
            <Link href={`/profile/${profile.up}`} key={profile.upLukso}>
              <ProfileCard upAddress={profile.upLukso} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Profiles;
