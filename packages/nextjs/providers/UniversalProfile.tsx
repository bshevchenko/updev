import React, { Dispatch, SetStateAction, createContext, useEffect, useState } from "react";

interface UniversalProfileData {
  address: string;
  // Add other fields here as needed
}

interface UniversalProfileContextType {
  universalProfileData: UniversalProfileData;
  setUniversalProfileData: Dispatch<SetStateAction<UniversalProfileData>>;
}

// Provide a default context value that matches the type
const defaultContextValue: UniversalProfileContextType = {
  universalProfileData: { address: "" }, // Provide default values for all fields
  setUniversalProfileData: () => console.warn("setData called without a context provider"), // Provide a no-op function
};

export const UniversalProfileContext = createContext<UniversalProfileContextType>(defaultContextValue);

export const UniversalProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [universalProfileData, setUniversalProfileData] = useState<UniversalProfileData>(
    defaultContextValue.universalProfileData,
  );

  useEffect(() => {
    // This code will only run on the client-side
    const savedData = localStorage.getItem("universalProfileData");
    if (savedData) {
      setUniversalProfileData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // This code will only run on the client-side
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
