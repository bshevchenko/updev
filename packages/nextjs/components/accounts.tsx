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
  HandThumbUpIcon,
  LockClosedIcon,
  TagIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export const Accounts = ({ isFetchingTokens, tokens }: { isFetchingTokens: boolean; tokens: object }) => {
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
