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
  const [universalProfileData, setUniversalProfileData] = useState<UniversalProfileData>(() => {
    // Check if window is defined (i.e., if we're running in the browser)
    if (typeof window !== "undefined") {
      // Read the stored data from local storage on initial load
      const savedData = localStorage.getItem("universalProfileData");
      return savedData ? JSON.parse(savedData) : {}; // Replace {} with your default value
    }
  });

  useEffect(() => {
    // Check if window is defined before trying to access localStorage
    if (typeof window !== "undefined") {
      // Write data to local storage whenever it changes
      localStorage.setItem("universalProfileData", JSON.stringify(universalProfileData));
    }
  }, [universalProfileData]);

  return (
    <UniversalProfileContext.Provider value={{ universalProfileData, setUniversalProfileData }}>
      {children}
    </UniversalProfileContext.Provider>
  );
};
