import { useEffect, useState } from "react";
import Link from "next/link";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import type { NextPage } from "next";
import lspSchemas from "~~/LSP3ProfileMetadata.json";
import { ProfileCard } from "~~/components";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { LSP24_SCHEMA_NAME } from "~~/types/Profile";
import upRegistryProfile from "~~/types/Profile";

const Profiles: NextPage = () => {
  const [verifiedProfiles, setVerifiedProfiles] = useState<upRegistryProfile[] | undefined>(undefined);

  const { data: profiles } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "ups",
  });

  useEffect(() => {
    const checkIfVerified = async (profile: upRegistryProfile): Promise<boolean> => {
      try {
        const erc725js = new ERC725(lspSchemas as ERC725JSONSchema[], profile.upLukso, "https://rpc.lukso.gateway.fm", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        const lsp24 = await erc725js.fetchData(LSP24_SCHEMA_NAME);
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

  return (
    <div className="px-5 md:px-10 lg:px-20 py-20">
      <div className="flex justify-center items-center mb-20 gap-4">
        <h1 className="text-center text-5xl mb-0 mt-1 font-bold">Discover Profiles</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {verifiedProfiles &&
          verifiedProfiles.map((profile: upRegistryProfile) => (
            <Link href={`/profile/${profile.up}`} key={profile.upLukso}>
              <ProfileCard upAddress={profile.upLukso} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Profiles;
