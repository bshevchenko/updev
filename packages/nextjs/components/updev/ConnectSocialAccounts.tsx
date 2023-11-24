import Image from "next/image";

export const ConnectSocialAccounts = () => {
  const socialItems = [
    { title: "Github", logo: "/github.svg" },
    { title: "LinkedIn", logo: "/linkedin.svg" },
    { title: "buildbox", logo: "/link.svg" },
    { title: "BuidlGuidl", logo: "/link.svg" },
  ];
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 w-full gap-6">
        {socialItems.map(item => (
          <div
            key={item.title}
            className="flex bg-base-100 w-full p-5 justify-between items-center rounded-xl border border-base-200 gap-24"
          >
            <div>
              <div className="flex gap-3 items-center mb-3">
                <Image alt="brand logo" width={24} height={24} src={item.logo} />
                <h5 className="text-xl font-bold">{item.title}</h5>
              </div>
              <p className="text-base-content my-0">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium dolorem, eveniet aspernatur ullam
                praesentium perspiciatis ducimus.
              </p>
            </div>
            <button className="btn btn-primary">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
};
