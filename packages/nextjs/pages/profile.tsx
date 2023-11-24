import Image from "next/image";
import type { NextPage } from "next";
import { ConnectSocialAccounts } from "~~/components/updev/";

const Profile: NextPage = () => {
  const tags = ["profile", "updev", "supaxero"];
  return (
    <div className="flex flex-col items-center py-10">
      <div className="max-w-3xl flex flex-col">
        <div className="relative mb-5">
          <div className="w-full h-40 bg-base-200 rounded-xl">
            <Image alt="cover picture" fill src="/default-profile-bg.png" />
          </div>
          <div className="absolute -bottom-16 start-5 rounded-full w-32 h-32">
            <Image alt="profile picture" width={128} height={128} src="/default-profile-picture.png" />
          </div>
        </div>
        <div className="flex mb-10">
          <div className="w-96"></div>
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-2xl mb-0 font-bold">Johnny Mnemonic</h3>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-[#FFFFFFA3]">
                @starlord <span className="text-[#FFFFFF5C]">#E593</span>
              </div>
              <div className="text-[#FFFFFF5C]">·</div>
              <div className="] bg-base-100 px-1.5 py-0.5 rounded-md border border-base-200">
                🆙 <span className="text-[#FFFFFF5C]">0xE593...4a444</span>
              </div>
              <div className="text-[#FFFFFF5C]">·</div>
              <div className="flex items-center gap-1">
                <div>
                  <Image width={12} height={12} alt="link icon" src="/link.svg" />
                </div>
                <div className="text-[#FFFFFFA3] underline">starlord.xyz</div>
              </div>
            </div>
            <div>
              <div className="text-base-content">Bio</div>
              <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum cum ullam aliquid asperiores natus, est
                ipsam autem! Perferendis rem neque nobis, necessitatibus ad, inventore odit nam ex quidem excepturi non.
              </div>
            </div>
            <div className="flex gap-1">
              {tags.map(tag => (
                <div key={tag} className="text-accent font-semibold bg-base-100 px-1 rounded-md border border-base-200">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="text-2xl font-bold mb-3">Your achievements</h3>
          <div className="flex gap-3">
            <Image width={117} height={117} alt="achievement icon" src="/achievements/universal-profile.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/github.svg" />
            <Image width={117} height={117} alt="achievement icon" src="/achievements/linkedin.svg" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-3">Connect your upDev to earn achievements</h3>
          <ConnectSocialAccounts />
        </div>
      </div>
    </div>
  );
};

export default Profile;
