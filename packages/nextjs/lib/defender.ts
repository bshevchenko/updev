import { RelayerParams } from "@openzeppelin/defender-relay-client";
import { DefenderRelayProvider, DefenderRelaySigner } from "@openzeppelin/defender-relay-client/lib/ethers";

const credentials: RelayerParams = {
  apiKey: process.env.DEFENDER_RELAYER_API_KEY || "",
  apiSecret: process.env.DEFENDER_RELAYER_API_SECRET || "",
};
export const provider = new DefenderRelayProvider(credentials);
export const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });
