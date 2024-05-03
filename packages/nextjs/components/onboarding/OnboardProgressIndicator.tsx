import React from "react";
import Image from "next/image";

/** Steps component
 *
 * @param {number} completedSteps how many steps user has completed
 */

type StepsProps = {
  completedSteps: number;
};

enum StepState {
  Completed = "completed",
  Active = "active",
  Inactive = "inactive",
}

export const OnboardProgressIndicator: React.FC<StepsProps> = ({ completedSteps }) => {
  const steps = ["OAuth", "Deploy Universal Profile", "Finish"];

  const getStepState = (index: number) => {
    if (index < completedSteps) return StepState.Completed;
    return index === completedSteps ? StepState.Active : StepState.Inactive;
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
