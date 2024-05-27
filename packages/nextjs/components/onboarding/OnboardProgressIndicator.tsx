import React from "react";

type StepsProps = {
  progress: string;
};

export const OnboardProgressIndicator: React.FC<StepsProps> = ({ progress }) => {
  return (
    <div className="h-1 w-[384px] bg-gray-800 rounded overflow-hidden">
      <div className="h-full bg-green-500" style={{ width: progress }}></div>
    </div>
  );
};
