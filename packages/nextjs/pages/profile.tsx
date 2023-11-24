import Image from "next/image";
import type { NextPage } from "next";

const Profile: NextPage = () => {
  return (
    <div className="flex p-10 gap-10">
      <div className="w-96">
        <div className="relative mb-20">
          <div className="w-96 h-40 bg-base-200 rounded-xl"></div>
          <div className="absolute -bottom-16 start-6  h-32 w-32 bg-accent rounded-full"></div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-2xl mb-0 font-bold">Johnny Mnemonic</h3>
          </div>
          <div>
            <div className="text-base-content">@starlord #E593</div>
          </div>
          <div className="flex items-center gap-1">
            <div>
              <Image width={12} height={12} alt="link icon" src="/link.svg" />
            </div>
            <div className="text-base-content">starlord.xyz</div>
          </div>
          <div>
            <div className="text-base-content">Bio</div>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum cum ullam aliquid asperiores natus, est ipsam
              autem! Perferendis rem neque nobis, necessitatibus ad, inventore odit nam ex quidem excepturi non.
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10">
        <div>
          <h3 className="text-2xl font-bold">Your achievements</h3>
        </div>
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">Connect your upDev to earn achievements</h3>
        </div>
      </div>
    </div>
  );
};

export default Profile;
