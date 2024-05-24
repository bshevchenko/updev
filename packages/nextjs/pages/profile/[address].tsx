import { ReactElement, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { useAccount } from "wagmi";
import lspSchemas from "~~/LSP3ProfileMetadata.json";
import { LoadingSkeleton, ProfileDetails } from "~~/components/profile";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { NextPageWithLayout } from "~~/pages/_app";
import Layout from "../../components/layout";
import { MintAccounts } from "~~/components/MintAccounts";
import { MetaHeader } from "~~/components/MetaHeader";

const Profile: NextPageWithLayout = () => {
  const router = useRouter();

  if (!router.query.address) {
    return <LoadingSkeleton />;
  } else {
    return (
      <ProfileContents up={Array.isArray(router.query.address) ? router.query.address[0] : router.query.address} />
    );
  }
};

Profile.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default Profile;

const ProfileContents = ({ up }: { up: string }) => {
  const account = useAccount();
  const [metadata, setMetadata] = useState<any>(null);

  const { data: myUP } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  const isMyProfile = !!(myUP && up == myUP);

  const initialized = useRef(false)
  useEffect(() => {
    async function fetchData() {
      try {
        const erc725js = new ERC725(
          lspSchemas as ERC725JSONSchema[],
          up,
          "https://rpc.testnet.lukso.network", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        const profileMetaData = await erc725js.fetchData("LSP3Profile");
        setMetadata(profileMetaData.value);
      } catch (error) {
        console.error("Error fetching ERC725 data:", error);
      }
    }
    if (!initialized.current) {
      initialized.current = true;
      fetchData();
    }
  })

  if (!metadata || !up) {
    return <LoadingSkeleton />;
  }

  function formatDate(date: Date) {
    // Get day, month, and year components
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const year = date.getFullYear();

    // Create the formatted date string
    const formattedDate = `${day}.${month}.${year}`;

    return formattedDate;
  }

  return (
    <>
      <MetaHeader title={`upDev – ${metadata.LSP3Profile.name}`} />
      <div className="flex flex-col items-center py-10">
        <div className="max-w-3xl flex flex-col">

          <ProfileDetails
            metadata={metadata}
            up={isMyProfile ? myUP : up}
            isMyProfile={isMyProfile}
          />
          <MintAccounts up={up} isMyProfile={isMyProfile} />
        </div>
      </div>
    </>
  );
};
