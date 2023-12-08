export const LoadingSkeleton = () => {
  return (
    <div className="flex justify-center py-10">
      <div className="flex flex-col gap-5 w-[48rem]">
        <div className="skeleton w-full h-[200px] bg-base-200 w-full rounded-3xl animate-pulse"></div>
        <div className="skeleton w-1/2 h-5 bg-base-200 rounded-3xl animate-pulse"></div>
        <div className="skeleton w-1/2 h-5 bg-base-200 rounded-3xl animate-pulse"></div>
        <div className="skeleton w-full h-5 bg-base-200 rounded-3xl animate-pulse"></div>
        <div className="skeleton w-full h-5 bg-base-200 rounded-3xl animate-pulse"></div>
      </div>
    </div>
  );
};
