import React from "react";
import Image from "next/image";

/** Steps component
 *
 * @param {number} currentStep - Current step number
 */

type StepsProps = {
  currentStep: number;
};

enum StepState {
  Completed = "completed",
  Active = "active",
  Inactive = "inactive",
}

export const Steps: React.FC<StepsProps> = ({ currentStep }) => {
  const steps = [
    "Connect Universal Profile",
    "Deploy UP",
    "Connect your social accounts",
    "Set up your profile (TODO)",
  ];

  const getStepState = (index: number) => {
    if (index < currentStep) return StepState.Completed;
    return index === currentStep ? StepState.Active : StepState.Inactive;
  };

  const getIconSrc = (state: StepState) => {
    switch (state) {
      case "completed":
        return "/completed-step.svg";
      case "active":
        return "/active-step.svg";
      default:
        return "/inactive-step.svg";
    }
  };

  return (
    <div className="flex w-[450px] justify-around items-center gap-5 mb-24">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <div className="relative flex flex-col items-center">
            <Image alt="Step icon" width={25} height={25} src={getIconSrc(getStepState(index))} />
            <div
              className={`absolute top-full mt-2 text-sm w-32 text-center ${
                getStepState(index) === "completed" ? "text-accent" : ""
              } ${getStepState(index) === "active" ? "font-bold" : ""}
              ${getStepState(index) === "inactive" ? "text-secondary" : ""}`}
            >
              {label}
            </div>
          </div>
          {index < steps.length - 1 && <div className="bg-secondary flex-grow h-0.5"></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

// return (
//   <div className="flex w-[450px] justify-around items-center gap-5 mb-24">
//     <div className="relative flex flex-col items-center">
//       <Image alt="upDev logo" width={25} height={25} src="/completed-step.svg" />
//       <div className="text-accent absolute top-full mt-2 text-sm w-32 text-center">
//         Connect with Universal Profile
//       </div>
//     </div>
//     <div className="bg-secondary flex-grow h-0.5"></div>
//     <div className="relative flex flex-col items-center">
//       <Image alt="upDev logo" width={25} height={25} src="/active-step.svg" />
//       <div className="absolute top-full mt-2 text-sm w-32 text-center font-bold">Connect your social accounts</div>
//     </div>
//     <div className="bg-secondary grow h-0.5"></div>
//     <div className="relative flex flex-col items-center">
//       <Image alt="upDev logo" width={25} height={25} src="/inactive-step.svg" />
//       <div className="text-secondary absolute top-full mt-2 text-sm w-[147px] text-center">
//         <div>Set up your</div>profile
//       </div>
//     </div>
//   </div>
// );
