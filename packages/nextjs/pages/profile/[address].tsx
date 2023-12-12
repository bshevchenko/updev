import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import UniversalProfileContract from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { toHex } from "viem";
import { useAccount, useContractRead } from "wagmi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import lspSchemas from "~~/LSP3ProfileMetadata.json";
import { ConnectSocialAccounts } from "~~/components/updev/";
import { LoadingSkeleton, ProfileDetails } from "~~/components/updev/profile/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import upRegistryProfile from "~~/types/Profile";

const coder = ethers.utils.defaultAbiCoder;

// TODO change from ethers to viem?

const GITHUB = "github";
const BUIDLGUIDL = "buidlguidl";

interface GitHubStats {
  days: number;
  followers: number;
  contributions: number;
}

interface BuidlGuidlStats {
  days: number;
  builds: number;
  role: string;
  function: string;
}

interface Token {
  id: string;
  data: string;
  name: {
    id: string;
    source: string;
  };
  stats: GitHubStats & BuidlGuidlStats;
}

export interface Accounts {
  [key: string]: Token;
}

const roles = {
  1: "Builder",
};

const functions = {
  1: "Cadets",
};

export const LSP24_SCHEMA_NAME = "LSP24MultichainAddressResolutionPolygon";

const Profile: NextPage = () => {
  const router = useRouter();
  const account = useAccount();
  const address = Array.isArray(router.query.address) ? router.query.address[0] : router.query.address || "";
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accounts, setAccounts] = useState<Accounts>({});
  const [metadata, setMetadata] = useState<any>(null);

  const { data: _profile } = useScaffoldContractRead({
    contractName: "upRegistry",
    functionName: "up",
    args: [address],
  }); // @ts-ignore
  const profile: upRegistryProfile | undefined = _profile && {
    up: _profile[0],
    keyManager: _profile[1],
    upLukso: _profile[2],
    eoa: _profile[3],
  };
  const upLukso: string | undefined = _profile && _profile[2];

  const { data: _myProfile } = useScaffoldContractRead({
    contractName: "upRegistry", // @ts-ignore
    functionName: "upByEOA",
    args: [account.address],
  }); // @ts-ignore
  const myProfile: upRegistryProfile | undefined = _myProfile;

  const isMyProfile = myProfile && address == myProfile.up;

  const { data: tokens } = useScaffoldContractRead({
    contractName: "upDevAccountOwnership",
    functionName: "getTokensByAddress",
    args: [address],
  });

  const { data: upDevUsername, refetch: refetchUpDevUsername } = useContractRead({
    address: address,
    abi: UniversalProfileContract.abi,
    functionName: "getData",
    args: [toHex("username", { size: 32 })],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const erc725js = new ERC725(lspSchemas as ERC725JSONSchema[], upLukso, "https://rpc.lukso.gateway.fm", {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs",
        });
        const profileMetaData = await erc725js.fetchData("LSP3Profile");

        // Get LSP24 reference from Lukso Mainnet UP to Mumbai (chain id = 0x13881 = 80001) UP
        // TODO use proper LSP24 name once it is officialy released (once schema is available on erc725.js)
        const lsp24 = await erc725js.fetchData(LSP24_SCHEMA_NAME);
        if (lsp24.value !== address) {
          setIsNotVerified(true);
        }

        setMetadata(profileMetaData.value);
      } catch (error) {
        console.error("Error fetching ERC725 data:", error);
      }
    }
    if (upLukso) {
      console.log("Fetching Lukso profile...");
      fetchData();
    }
  }, [upLukso, address, setIsNotVerified]);

  useEffect(() => {
    if (!tokens) {
      return;
    }
    console.log("tokens", tokens); // @ts-ignore
    tokens.forEach((t: Token) => {
      // const [source, id] = ethers.utils.defaultAbiCoder.decode(["string", "string"], d);
      switch (t.name.source) {
        case GITHUB:
          const [days, followers, contributions] = coder.decode(["uint32", "uint32", "uint32"], t.data); // @ts-ignore
          t.stats = { days, followers, contributions };
          break;

        case BUIDLGUIDL: // @ts-ignore
          const [days2, builds, role, func] = coder.decode(["uint32", "uint32", "uint32", "uint32"], t.data); // @ts-ignore
          t.stats = { days: days2, builds: builds, role: roles[role], function: functions[func] };
      }
      accounts[t.name.source] = t;
      setAccounts(accounts);
    });
  }, [tokens, accounts]);

  const handleVerify = async () => {
    if (!window.lukso) {
      alert("Enable Universal Profile browser extension.");
    } else {
      if (!upLukso) {
        return;
      }
      setIsVerifying(true);
      const accounts = await window.lukso.request({ method: "eth_requestAccounts" });
      if (accounts[0] !== upLukso) {
        alert("Invalid profile. Please select profile that you used for your sign-up on upDev.");
        setIsVerifying(false);
        return;
      } else {
        const web3Provider = new ethers.providers.Web3Provider(window.lukso);
        const contract = new ethers.Contract(upLukso, UniversalProfileContract.abi, web3Provider.getSigner());
        try {
          const schema = lspSchemas.find(s => s.name === LSP24_SCHEMA_NAME);
          if (!schema) {
            console.error("Verification error: LSP24 schema not found");
            return;
          }
          const tx = await contract.setData(schema.key, address);
          await tx.wait();
          setIsNotVerified(false);
        } catch (e) {
          console.error(e);
        }
        setIsVerifying(false);
      }
    }
  };

  if (!metadata || !profile) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col items-center py-10">
      <div className="max-w-3xl flex flex-col">
        {isNotVerified && (
          <div className="border border-[#e36969] rounded-lg p-4 mb-3">
            <div className="text-[#e36969] flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6" />
              This account is not yet verified on Lukso Mainnet.&nbsp;
              {isMyProfile &&
                (isVerifying ? (
                  <>Veryfying...</>
                ) : (
                  <a href="#" onClick={() => handleVerify()} className="underline">
                    Verify
                  </a>
                ))}
            </div>
          </div>
        )}

        <ProfileDetails
          metadata={metadata}
          upDevUsername={upDevUsername}
          refetchUpDevUsername={refetchUpDevUsername}
          profile={isMyProfile ? myProfile : profile}
          isMyProfile={isMyProfile}
          isNotVerified={isNotVerified}
          accounts={accounts}
        />

        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-3">Achievements</h3>
          <div className="flex gap-3">
            <div className="tooltip tooltip-primary" data-tip="Universal Profile Owner">
              <Image width={117} height={117} alt="achievement icon" src="/achievements/up.svg" />
            </div>
            <div className="tooltip tooltip-primary" data-tip="upDev Early Adopter">
              <Image width={117} height={117} alt="achievement icon" src="/achievements/og-updev.svg" />
            </div>
            {accounts[GITHUB] && (
              <div
                className="tooltip tooltip-primary"
                data-tip={`
                  Verified GitHub Account.
                  Created ${accounts[GITHUB].stats.days} days ago, 
                  ${accounts[GITHUB].stats.followers} followers,
                  ${accounts[GITHUB].stats.contributions} contributions in the last year
                `}
              >
                <Image width={117} height={117} alt="achievement icon" src="/achievements/github.svg" />
              </div>
            )}
            {accounts[BUIDLGUIDL] && (
              <div
                className="tooltip tooltip-primary"
                data-tip={`
                  Verified BuidlGuidl Account.
                  Created ${accounts[BUIDLGUIDL].stats.days} days ago, 
                  ${accounts[BUIDLGUIDL].stats.role},
                  ${accounts[BUIDLGUIDL].stats.function},
                  ${accounts[BUIDLGUIDL].stats.builds} build(s) submitted
                `}
              >
                <Image width={117} height={117} alt="achievement icon" src="/achievements/buidlguidl.svg" />
              </div>
            )}
          </div>
        </div>
        {isMyProfile && (
          <div>
            <h3 className="text-2xl font-bold mb-3">Connect accounts</h3>
            <ConnectSocialAccounts />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
