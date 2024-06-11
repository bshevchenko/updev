import popupCenter from "./popupCenter";

const accounts = [
  {
    name: "twitter",
    title: "Twitter",
    logo: "/x.svg",
    comingSoon: false,
    step1: "",
    modalImage: "",
    url: "",
  },
  {
    name: "github",
    title: "GitHub",
    logo: "/github.svg",
    comingSoon: false,
    url: "https://github.com",
  },
  {
    name: "google",
    title: "Google",
    logo: "/google.svg",
    comingSoon: false,
    url: "https://google.com",
  },
  {
    name: "discord",
    title: "Discord",
    logo: "/discord.svg",
    comingSoon: false,
    url: "https://discord.com",
  },
  {
    name: "linkedin",
    title: "LinkedIn",
    logo: "/linkedin.svg",
    comingSoon: false,
    url: "https://linkedin.com",
  },
  {
    name: "telegram",
    title: "Telegram",
    logo: "/telegram.svg",
    url: "https://telegram.org",
    comingSoon: false,
    isModal: true,
    isCustom: true,
    step1: (
      <>
        Say hi to{" "}
        <a
          href="https://t.me/upDev_auth_bot"
          target="_blank"
          className="underline cursor-pointer text-accent"
          rel="noreferrer"
        >
          @upDev_auth_bot
        </a>
        {/* <li className="mt-5">(optional) Add <a href="https://t.me/upDev_auth_bot" target="_blank" className="underline cursor-pointer text-accent">@upDev_auth_bot</a> to your chat admins with no permissions.</li> */}
        <li className="mt-5">Optional: select your personal chat in your Telegram profile settings.</li>
        <li className="mt-5">
          Optional: add your personal chat on{" "}
          <a
            href="https://tgstat.com/"
            target="_blank"
            className="underline cursor-pointer text-accent"
            rel="noreferrer"
          >
            tgstat.com
          </a>{" "}
          and make sure it is available there.
        </li>
      </>
    ),
    step1Contents: (
      <li className="mt-5">
        <button className="btn btn-secondary ml-2" onClick={() => popupCenter("/oauth/telegram", "telegram")}>
          Sign In with Telegram
        </button>
      </li>
    ),
    // step2: "(optional) Provide your chat ID:",
  },
  {
    name: "buidlguidl",
    title: "BuidlGuidl",
    logo: "/buidlguidl.svg",
    comingSoon: false,
    isModal: true,
    step1: (
      <>
        On your BuidlGuidl{" "}
        <a
          href="https://app.buidlguidl.com/"
          className="underline cursor-pointer text-accent"
          target="_blank"
          rel="noreferrer"
        >
          portfolio page
        </a>
        , update your status to include:
      </>
    ),
    step1Contents: `https://updev.vercel.app/profile/{up}`, // TODO env?
    step2: "Provide address of EOA for your BuidlGuidl profile:",
    modalImage: "/connect-bg.png",
  },
  {
    name: "https",
    title: "WebSite",
    logo: "/link.svg",
    comingSoon: false,
    isModal: true,
    step1: (
      <>
        Expose <i>updev.json</i> at root of your website with the following contents:
      </>
    ),
    step1Contents: `{ "up": "{up}" }`,
    step2: "Provide domain name of your website:",
    step2Placeholder: "google.com",
  },
  {
    name: "instagram",
    title: "Instagram",
    logo: "/instagram.svg",
    comingSoon: false,
    test: true,
    url: "https://instagram.com",
  },
  {
    name: "eoa",
    title: "Crypto Wallet",
    logo: "/link.svg",
    comingSoon: true,
  },
  {
    name: "pass",
    title: (
      <a
        className="text-green-400 hover:underline"
        target="_blank"
        href="https://github.com/bshevchenko/updev?tab=readme-ov-file#identities"
        rel="noreferrer"
      >
        Pass NFT
      </a>
    ),
    logo: "/link.svg",
    comingSoon: true,
  },
  // {
  //   name: "buidlbox",
  //   title: "buidlbox",
  //   logo: "/link.svg",
  //   comingSoon: true,
  //   step1: "",
  //   modalImage: "",
  //   url: " ",
  // },
  // {
  //   name: "gitcoin",
  //   title: "GitCoin Passport",
  //   logo: "/passport.svg",
  //   comingSoon: true,
  //   step1: "",
  //   modalImage: "",
  //   url: "",
  // },
];

export default accounts;
