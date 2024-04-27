import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import type { NextPage } from "next";
import { toHex } from "viem";
import { useAccount, useContractRead } from "wagmi";
import lspSchemas from "~~/LSP3ProfileMetadata.json";
import { ConnectSocialAccounts } from "~~/components/updev/";
import { LoadingSkeleton, ProfileDetails } from "~~/components/updev/profile/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import {
  Accounts,
  BUIDLGUIDL,
  GITHUB,
  Token,
  functions,
  roles,
} from "~~/types/Profile";

const Profile: NextPage = () => {
  const router = useRouter();

  if (!router.query.address) {
    return <LoadingSkeleton />;
  } else {
    return (
      <ProfileContents up={Array.isArray(router.query.address) ? router.query.address[0] : router.query.address} />
    );
  }
};

export default Profile;

const ProfileContents = ({ up }: { up: string }) => {
  const account = useAccount();
  const [accounts, setAccounts] = useState<Accounts>({});
  const [metadata, setMetadata] = useState<any>(null);

  const { data: controller } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "controller",
    args: [up],
  });

  const { data: myUP } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [account.address],
  });

  const isMyProfile = !!(myUP && up == myUP);

  const { data: tokens } = useScaffoldContractRead({
    contractName: "upDevAccountNFT",
    functionName: "tokenIdsOf",
    args: [up],
  });

  const upDevUsername = toHex("Boris Shevchenko"); // TODO tmp
  // const { data: upDevUsername, refetch: refetchUpDevUsername } = useContractRead({
  //   address: up,
  //   abi: UniversalProfileContract.abi,
  //   functionName: "getData",
  //   args: [toHex("username", { size: 32 })],
  // });

  useEffect(() => {
    async function fetchData() {
      console.log("Fetching...");
      try {
        const erc725js = new ERC725(
          lspSchemas as ERC725JSONSchema[],
          "0x4D454777ddDf8541D01c54fe03Cf216a7391cb62", // TODO tmp
          "https://rpc.lukso.gateway.fm", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        const profileMetaData = await erc725js.fetchData("LSP3Profile");

        setMetadata(profileMetaData.value);
      } catch (error) {
        console.error("Error fetching ERC725 data:", error);
      }
    }
    if (up) {
      fetchData();
    }
  }, [up]);

  useEffect(() => {
    if (!tokens) {
      return;
    } // @ts-ignore
    tokens.forEach((t: Token) => {
      const unixTimestampInDays = Math.floor(Date.now() / 1000 / 86400);
      switch (t.name.source) {
        case GITHUB:
          const [created, followers, contributions] = coder.decode(["uint32", "uint32", "uint32"], t.data);
          const days = unixTimestampInDays - created;
          // @ts-ignore
          t.stats = { created, days, followers, contributions };
          break;

        case BUIDLGUIDL: // @ts-ignore
          const [created2, builds, role, func] = coder.decode(["uint32", "uint32", "uint32", "uint32"], t.data);
          const days2 = unixTimestampInDays - created2;
          // @ts-ignore
          t.stats = { created: created2, days: days2, builds: builds, role: roles[role], function: functions[func] };
      }
      accounts[t.name.source] = t;
      setAccounts(accounts);
    });
  }, [tokens, accounts]);

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
    <div className="flex flex-col items-center py-10">
      <div className="max-w-3xl flex flex-col">

        <ProfileDetails
          metadata={metadata}
          upDevUsername={upDevUsername}
          refetchUpDevUsername={() => {}}
          up={isMyProfile ? myUP : up}
          isMyProfile={isMyProfile}
          accounts={accounts}
        />

        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-3">Achievements</h3>
          <div className="flex gap-3">
            <div className="tooltip tooltip-primary w-32 h-32" data-tip="Universal Profile Owner">
              <Image fill alt="achievement icon" src="/achievements/up.svg" priority />
            </div>
            <div className="tooltip tooltip-primary  w-32 h-32" data-tip="upDev Early Adopter">
              <Image fill alt="achievement icon" src="/achievements/og-updev.svg" priority />
            </div>
            {accounts[GITHUB] && (
              <div
                className="tooltip tooltip-primary w-32 h-32"
                data-tip={`
                  Verified GitHub account on ${formatDate(new Date(Number(accounts[GITHUB].timestamp) * 1000))}.
                  Created ${accounts[GITHUB].stats.days} days ago, 
                  ${accounts[GITHUB].stats.followers} followers,
                  ${accounts[GITHUB].stats.contributions} contributions in the last year
                `}
              >
                <Image fill alt="achievement icon" src="/achievements/github.svg" priority />
              </div>
            )}
            {accounts[BUIDLGUIDL] && (
              <div
                className="tooltip tooltip-primary w-32 h-32"
                data-tip={`
                  Verified BuidlGuidl account on ${formatDate(new Date(Number(accounts[BUIDLGUIDL].timestamp) * 1000))}.
                  Created ${accounts[BUIDLGUIDL].stats.days} days ago, 
                  ${accounts[BUIDLGUIDL].stats.role},
                  ${accounts[BUIDLGUIDL].stats.function},
                  ${accounts[BUIDLGUIDL].stats.builds} build(s) submitted
                `}
              >
                <Image fill alt="achievement icon" src="/achievements/buidlguidl.svg" priority />
              </div>
            )}
          </div>
        </div>
        {isMyProfile && (
          <div>
            <h3 className="text-2xl font-bold mb-3">Connect accounts</h3>
            TODO
            {/* <ConnectSocialAccounts /> */}
          </div>
        )}
      </div>
    </div>
  );
};
