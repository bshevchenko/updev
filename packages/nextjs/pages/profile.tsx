import Image from "next/image";
import type { NextPage } from "next";
import { ConnectSocialAccounts } from "~~/components/updev/";

const Profile: NextPage = () => {
  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="max-w-3xl">
        <div className="relative mb-5">
          <div className="w-full h-40 bg-base-200 rounded-xl"></div>
          <div className="absolute -bottom-16 start-5 h-32 w-32 bg-accent rounded-full"></div>
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
              <div>profile</div>
              <div>updev</div>
              <div>supaxero</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold">Your achievements</h3>
        </div>
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">Connect your upDev to earn achievements</h3>
          <ConnectSocialAccounts />
        </div>
      </div>
    </div>
  );
};

export default Profile;
