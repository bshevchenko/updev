import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import moment from "moment";
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  AtSymbolIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  DocumentIcon,
  DocumentMagnifyingGlassIcon,
  EyeIcon,
  HandThumbUpIcon,
  LockClosedIcon,
  TagIcon,
  UserCircleIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

const Accounts = ({ isFetchingTokens, tokens }: { isFetchingTokens: boolean; tokens: object }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const closeModal = () => {
    setActiveModal(null);
  };
  const renderModalContent = (token: any) => {
    return (
      <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
        {/* <b>{token.provider}</b><br /> */}
        <pre>{JSON.stringify(token, null, 2)}</pre>
      </div>
    );
  };
  return (
    <div className="w-full">
      {isFetchingTokens && (
        <div className="ml-3 mr-3 mb-5">
          <div className="flex flex-row gap-5 w-full">
            <div className="skeleton w-1/3 h-[200px] bg-base-100 rounded-xl animate-pulse"></div>
            <div className="skeleton w-1/3 h-[200px] bg-base-100 rounded-xl animate-pulse"></div>
            <div className="skeleton w-1/3 h-[200px] bg-base-100 rounded-xl animate-pulse"></div>
          </div>
        </div>
      )}
      {/* <h3 className="text-2xl font-bold">Account NFTs</h3> */}
      {Object.entries(tokens).length > 0 && (
        <div className="flex flex-wrap">
          {Object.entries(tokens).map(([key, token]) => (
            <div
              className="w-275 bg-base-100 p-5 mr-3 mb-5 rounded-xl lg:w-[244px] break-all w-full ml-3 lg:ml-0"
              key={key}
            >
              {token.provider == "github" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="github" width={46} height={46} src="/github.svg" priority />
                    <b className="ml-3">GitHub</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div className="mb-3">
                    <a
                      className="text-green-400 hover:underline"
                      target="_blank"
                      href={`https://github.com/${token.data.login}`}
                      rel="noreferrer"
                    >
                      @{token.data.login}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <CalendarDaysIcon className="w-6 mr-1" />
                    {moment(token.data.created_at).format("DD.MM.YYYY")}
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <UsersIcon className="w-6 mr-1" />
                    <a
                      href={`https://github.com/${token.data.login}?tab=followers`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.followers}
                    </a>
                    &nbsp;followers
                  </div>
                  {/* ({(() => { const a = moment().diff(token.data.created_at, "years", true); return a >= 1 ? `${moment().diff(token.data.created_at, "years")}y ${moment().diff(token.data.created_at, "months") % 12}m` : `${moment().diff(token.data.created_at, "months")} months` })()}) */}
                  <div className="flex items-center mt-3 mb-3">
                    <ArchiveBoxIcon className="w-6 mr-1" />
                    <a
                      href={`https://github.com/${token.data.login}?tab=repositories`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.public_repos}
                    </a>
                    &nbsp;repos
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <DocumentIcon className="w-6 mr-1" />
                    <a
                      href={`https://gist.github.com/${token.data.login}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.public_gists}
                    </a>
                    &nbsp;gists
                  </div>
                </>
              )}
              {token.provider == "google" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="google" width={46} height={46} src="/google.svg" priority />
                    <b className="ml-3">Google</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <a
                      href={`mailto:${token.data.email}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.email}
                    </a>
                  </div>
                  {token.data.verified_email && (
                    <div className="flex items-center mt-3 mb-3">
                      <CheckBadgeIcon className="w-6 mr-1" />
                      Verified
                    </div>
                  )}
                  {token.data.youtube.items.length && (
                    <>
                      <div className="flex items-center mt-3 mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          className="w-6"
                          viewBox="0 0 50 50"
                          fill="white"
                        >
                          <path d="M 9 4 C 6.24 4 4 6.24 4 9 L 4 41 C 4 43.76 6.24 46 9 46 L 41 46 C 43.76 46 46 43.76 46 41 L 46 9 C 46 6.24 43.76 4 41 4 L 9 4 z M 15 8 L 17.400391 8 L 19 12 L 20.599609 8 L 23 8 L 20 15 L 20 19 L 18 19 L 18 14.990234 C 17.4 13.380234 15.41 9.01 15 8 z M 25 11 C 25.89 11 26.770078 11.269219 27.330078 11.949219 C 27.760078 12.439219 28 13.229531 28 14.269531 L 28 15.730469 C 28 16.770469 27.800859 17.490469 27.380859 17.980469 C 26.820859 18.650469 25.89 19 25 19 C 24.11 19 23.200625 18.650469 22.640625 17.980469 C 22.210625 17.490469 22 16.770469 22 15.730469 L 22 14.279297 C 22 13.239297 22.229922 12.439219 22.669922 11.949219 C 23.229922 11.269219 23.99 11 25 11 z M 29 11 L 31 11 L 31 17 C 31.05 17.27 31.339375 17.390625 31.609375 17.390625 C 32.019375 17.390625 32.54 16.910859 33 16.380859 L 33 11 L 35 11 L 35 19 L 33 19 L 33 17.619141 C 32.19 18.409141 31.499844 19.000703 30.589844 18.970703 C 29.929844 18.950703 29.470234 18.710469 29.240234 18.230469 C 29.100234 17.950469 29 17.499844 29 16.839844 L 29 11 z M 25 12.619141 C 24.8625 12.619141 24.730859 12.649297 24.611328 12.701172 C 24.491797 12.753047 24.383594 12.827422 24.292969 12.919922 C 24.202344 13.012422 24.128906 13.122266 24.078125 13.244141 C 24.027344 13.366016 24 13.500625 24 13.640625 L 24 16.449219 C 24 16.729219 24.111719 16.984922 24.292969 17.169922 C 24.383594 17.262422 24.491797 17.336797 24.611328 17.388672 C 24.730859 17.440547 24.8625 17.470703 25 17.470703 C 25.1375 17.470703 25.269141 17.440547 25.388672 17.388672 C 25.747266 17.233047 26 16.869219 26 16.449219 L 26 13.640625 C 26 13.080625 25.55 12.619141 25 12.619141 z M 24.990234 22 L 25.009766 22 C 25.009766 22 31.719219 22.000312 36.199219 22.320312 C 36.829219 22.390313 38.190156 22.400391 39.410156 23.650391 C 40.370156 24.590391 40.679688 26.75 40.679688 26.75 C 40.679688 26.75 41 28.280547 41 30.810547 L 41 33.179688 C 41 35.709688 40.679688 37.240234 40.679688 37.240234 C 40.679688 37.240234 40.370156 39.399844 39.410156 40.339844 C 38.190156 41.589844 36.829219 41.599922 36.199219 41.669922 C 31.719219 41.989922 25 42 25 42 C 25 42 16.679141 41.919688 14.119141 41.679688 C 13.409141 41.549687 11.809844 41.589609 10.589844 40.349609 C 9.6298437 39.399609 9.3203125 37.240234 9.3203125 37.240234 C 9.3203125 37.240234 9 35.709688 9 33.179688 L 9 30.810547 C 9 28.280547 9.3203125 26.75 9.3203125 26.75 C 9.3203125 26.75 9.6298438 24.590391 10.589844 23.650391 C 11.809844 22.400391 13.170781 22.390312 13.800781 22.320312 C 18.280781 22.000312 24.990234 22 24.990234 22 z M 12 26 L 12 27.978516 L 14 27.978516 L 14 38 L 16 38 L 16 27.978516 L 18 27.978516 L 18 26 L 12 26 z M 25 26 L 25 38 L 27 38 L 27 36.75 C 27.631 37.531 28.453 38 29.125 38 C 29.877 38 30.533156 37.595313 30.785156 36.820312 C 30.904156 36.401313 30.992 36.01 31 35.125 L 31 32.375 C 31 31.387 30.866234 30.642656 30.740234 30.222656 C 30.488234 29.441656 29.878 29.005 29.125 29 C 28.145 28.993 27.75 29.5 27 30.375 L 27 26 L 25 26 z M 18 29 L 18 35.685547 C 18 36.407547 18.100469 36.891984 18.230469 37.208984 C 18.450469 37.722984 18.899062 38 19.539062 38 C 20.269062 38 21.21 37.485766 22 36.634766 L 22 38 L 24 38 L 24 29 L 22 29 L 22 35.269531 C 21.56 35.853531 20.919531 36.289062 20.519531 36.289062 C 20.259531 36.289062 20.05 36.179578 20 35.892578 L 20 29 L 18 29 z M 35.029297 29 C 34.021297 29 33.234063 29.317016 32.664062 29.916016 C 32.244062 30.358016 32 31.080578 32 32.017578 L 32 35.083984 C 32 36.014984 32.2685 36.666516 32.6875 37.103516 C 33.2585 37.702516 34.044172 38 35.076172 38 C 36.107172 38 36.918844 37.686781 37.464844 37.050781 C 37.704844 36.769781 37.858781 36.453563 37.925781 36.101562 C 37.943781 35.942563 38 35.511 38 35 L 36 35 L 36 35.798828 C 36 36.262828 35.552 36.638672 35 36.638672 C 34.448 36.638672 34 36.261828 34 35.798828 L 34 34 L 38 34 L 38 33.423828 L 38 31.978516 C 38 31.043516 37.770422 30.359016 37.357422 29.916016 C 36.804422 29.317016 36.019297 29 35.029297 29 z M 35 30.447266 C 35.552 30.447266 36 30.824109 36 31.287109 L 36 32.615234 L 34 32.615234 L 34 31.287109 C 34 30.823109 34.448 30.447266 35 30.447266 z M 28.220703 30.746094 C 28.765703 30.746094 29 31.081 29 32.125 L 29 34.875 C 29 35.919 28.765703 36.279297 28.220703 36.279297 C 27.909703 36.279297 27.316 36.066 27 35.75 L 27 31.375 C 27.316 31.063 27.909703 30.746094 28.220703 30.746094 z"></path>
                        </svg>
                        &nbsp;
                        <a
                          href={`https://youtube.com/${token.data.youtube.items[0].snippet.customUrl}`}
                          className="text-green-400 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {token.data.youtube.items[0].snippet.customUrl}
                        </a>
                      </div>
                      <div className="flex items-center mt-3 mb-3">
                        <CalendarDaysIcon className="w-6 mr-1" />
                        {moment(token.data.youtube.items[0].snippet.publishedAt).format("DD.MM.YYYY")}
                      </div>
                      <div className="flex items-center mt-3 mb-3">
                        <UsersIcon className="w-6 mr-1" />
                        {token.data.youtube.items[0].statistics.subscriberCount} followers
                      </div>
                      <div className="flex items-center mt-3 mb-3">
                        <VideoCameraIcon className="w-6 mr-1" />
                        {token.data.youtube.items[0].statistics.videoCount} videos
                      </div>
                      <div className="flex items-center mt-3 mb-3">
                        <EyeIcon className="w-6 mr-1" />
                        {token.data.youtube.items[0].statistics.viewCount} views
                      </div>
                    </>
                  )}
                </>
              )}
              {token.provider == "twitter" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="google" width={46} height={46} src="/x.svg" priority />
                    <b className="ml-3">Twitter</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div className="mb-3">
                    <a
                      className="text-green-400 hover:underline"
                      target="_blank"
                      href={`https://x.com/${token.data.username}`}
                      rel="noreferrer"
                    >
                      @{token.data.username}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <CalendarDaysIcon className="w-6 mr-1" />
                    {moment(token.data.created_at).format("DD.MM.YYYY")}
                  </div>
                  {token.data.verified_type != "none" && (
                    <div className="flex items-center mt-3 mb-3 capitalize-first">
                      <CheckBadgeIcon className="w-6 mr-1" />
                      {token.data.verified_type}
                    </div>
                  )}
                  <div className="flex items-center mt-3 mb-3">
                    <UsersIcon className="w-6 mr-1" />
                    <a
                      href={`https://x.com/${token.data.login}/followers`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.public_metrics.followers_count}
                    </a>
                    &nbsp;followers
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <ChatBubbleLeftRightIcon className="w-6 mr-1" />
                    <a
                      href={`https://x.com/${token.data.login}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.public_metrics.tweet_count}
                    </a>
                    &nbsp;tweets
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <HandThumbUpIcon className="w-6 mr-1" />
                    <a
                      href={`https://x.com/${token.data.login}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.public_metrics.like_count}
                    </a>
                    &nbsp;likes
                  </div>
                </>
              )}
              {token.provider == "discord" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="discord" width={46} height={46} src="/discord.svg" priority />
                    <b className="ml-3">Discord</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <a
                      href={`https://discord.com/users/${token.data.username}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{token.data.username}
                    </a>
                  </div>
                  {token.data.verified && (
                    <div className="flex items-center mt-3 mb-3">
                      <AtSymbolIcon className="w-6 mr-1" />
                      <a
                        href={`mailto:${token.data.email}`}
                        className="text-green-400 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Verified Email
                      </a>
                    </div>
                  )}
                  {token.data.premium_type != "0" && (
                    <div className="flex items-center mt-3 mb-3">
                      <CheckBadgeIcon className="w-6 mr-1" />
                      {token.data.premium_type == "1" && "Nitro Classic"}
                      {token.data.premium_type == "2" && "Nitro"}
                      {token.data.premium_type == "3" && "Nitro Basic"}
                    </div>
                  )}
                  {token.data.mfa_enabled && (
                    <div className="flex items-center mt-3 mb-3">
                      <LockClosedIcon className="w-6 mr-1" />
                      2FA enabled
                    </div>
                  )}
                </>
              )}
              {token.provider == "buidlguidl" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="buidlguidl" width={46} height={46} src="/buidlguidl.svg" priority />
                    <b className="ml-3">BuidlGuidl</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <a
                      href={`https://app.buidlguidl.com/builders/${token.data.id}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.id.slice(0, 6) + "..." + token.data.id.slice(-4)}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <CalendarDaysIcon className="w-6 mr-1" />
                    {moment(token.data.creationTimestamp).format("DD.MM.YYYY")}
                  </div>
                  {token.data.ens && (
                    <div className="flex items-center mt-3 mb-3">
                      <AtSymbolIcon className="w-6 mr-1" />
                      <a
                        href={`https://app.ens.domains/${token.data.ens}`}
                        className="text-green-400 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {token.data.ens}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center mt-3 mb-3">
                    <ArchiveBoxIcon className="w-6 mr-1" />
                    <a
                      href={`https://github.com/${token.data.login}?tab=repositories`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.builds.length}
                    </a>
                    &nbsp;builds
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <UserCircleIcon className="w-6 mr-1" />
                    <span style={{ textTransform: "capitalize" }}>{token.data.function}</span>
                  </div>
                  {token.data.scholarship && (
                    <div className="flex items-center mt-3 mb-3">
                      <AcademicCapIcon className="w-6 mr-1" />
                      Scholarship
                    </div>
                  )}
                </>
              )}
              {token.provider == "https" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="website" width={46} height={46} src="/link.svg" priority />
                    <b className="ml-3">Website</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <a
                      href={`https://${token.id}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.id}
                    </a>
                  </div>
                </>
              )}
              {token.provider == "linkedin" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="LinkedIn" width={46} height={46} src="/linkedin.svg" priority />
                    <b className="ml-3">LinkedIn</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <a
                      href={`https://www.linkedin.com/search/results/all/?keywords=${token.data.name}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {token.data.name}
                    </a>
                  </div>
                  {token.data.email_verified && (
                    <div className="flex items-center mt-3 mb-3">
                      <AtSymbolIcon className="w-6 mr-1" />
                      <a
                        href={`mailto:${token.data.email}`}
                        className="text-green-400 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Verified Email
                      </a>
                    </div>
                  )}
                </>
              )}
              {token.provider == "instagram" && (
                <>
                  <div className="flex items-center mb-3">
                    <Image alt="Instagram" width={46} height={46} src="/instagram.svg" priority />
                    <b className="ml-3">Instagram</b>
                    <DocumentMagnifyingGlassIcon
                      onClick={() => setActiveModal(token)}
                      className="w-6 ml-3 text-gray-600 hover:text-green-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <a
                      href={`https://instagram.com/${token.data.username}`}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{token.data.username}
                    </a>
                  </div>
                  <div className="flex items-center mt-3 mb-3">
                    <TagIcon className="w-6 mr-1" />
                    &nbsp;
                    {token.data.account_type.charAt(0).toUpperCase() + token.data.account_type.slice(1).toLowerCase()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {activeModal && <Modal onClose={closeModal}>{renderModalContent(activeModal)}</Modal>}
    </div>
  );
};

export default Accounts;
