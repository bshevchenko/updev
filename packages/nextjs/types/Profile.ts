interface GitHubStats {
  created: number; // timestamp in days
  days: number;
  followers: number;
  contributions: number;
}

interface BuidlGuidlStats {
  created: number; // timestamp in days
  days: number;
  builds: number;
  role: string;
  function: string;
}

export interface Token {
  id: string;
  data: string;
  name: {
    id: string;
    source: string;
  };
  stats: GitHubStats & BuidlGuidlStats;
  timestamp: bigint;
}

export interface Accounts {
  [key: string]: Token;
}

export const LSP24_SCHEMA_NAME = "LSP24MultichainAddressResolutionPolygon";

export const GITHUB = "github";
export const BUIDLGUIDL = "buidlguidl";

export const roles = {
  1: "Builder",
};

export const functions = {
  0: "Fullstack",
  1: "Cadets",
};
