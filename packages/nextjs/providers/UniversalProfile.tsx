import React, { Dispatch, SetStateAction, createContext, useEffect, useState } from "react";

interface UniversalProfileData {
  address: string;
  // Add other fields here as needed
}

interface UniversalProfileContextType {
  universalProfileData: UniversalProfileData;
  setUniversalProfileData: Dispatch<SetStateAction<UniversalProfileData>>;
}

const defaultContextValue: UniversalProfileContextType = {
  universalProfileData: { address: "" },
  setUniversalProfileData: () => console.warn("setData called without a context provider"),
};

export const UniversalProfileContext = createContext<UniversalProfileContextType>(defaultContextValue);

/**
 * Universal Profile address available to any component that consumes the context
 */

export const UniversalProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [universalProfileData, setUniversalProfileData] = useState<UniversalProfileData>(
    defaultContextValue.universalProfileData,
  );

  // useEffect forces code to run on the client-side
  useEffect(() => {
    const savedData = localStorage.getItem("universalProfileData");
    if (savedData) {
      setUniversalProfileData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // Write data to local storage whenever it changes
    localStorage.setItem("universalProfileData", JSON.stringify(universalProfileData));
  }, [universalProfileData]);

  return (
    <UniversalProfileContext.Provider value={{ universalProfileData, setUniversalProfileData }}>
      {children}
    </UniversalProfileContext.Provider>
  );
};
