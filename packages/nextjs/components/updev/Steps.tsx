/** Steps component
 *
 */

export const Steps = () => {
  //   const baseCircleClasses = "w-6 h-6 border-2 border-accent rounded-full mb-3";

  //   const conditionalCircleClasses = `${baseCircleClasses} ${isActive ? "border-accent" : "border-secondary"} ${
  //     isCompleted ? "bg-accent" : ""
  //   }`;

  return (
    <div className="flex w-[450px] justify-around items-center gap-5 mb-24">
      <div className="relative flex flex-col items-center">
        <div className="w-6 h-6 border-2 border-accent rounded-full"></div>
        <div className="font-bold absolute top-full mt-2 text-sm w-32 text-center">Connect with Universal Profile</div>
      </div>
      <div className="bg-secondary flex-grow h-0.5"></div>
      <div className="relative flex flex-col items-center">
        <div className="w-6 h-6 border-2 border-secondary rounded-full"></div>
        <div className="text-secondary absolute top-full mt-2 text-sm w-32 text-center">
          Connect your social accounts
        </div>
      </div>
      <div className="bg-secondary grow h-0.5"></div>
      <div className="relative flex flex-col items-center">
        <div className="w-6 h-6 border-2 border-secondary rounded-full"></div>
        <div className="text-secondary absolute top-full mt-2 text-sm w-[147px] text-center">
          <div>Set up your</div>profile
        </div>
      </div>
    </div>
  );
};
