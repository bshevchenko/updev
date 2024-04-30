import { DefenderRelaySigner, DefenderRelayProvider } from "@openzeppelin/defender-relay-client/lib/ethers";
import { RelayerParams } from "@openzeppelin/defender-relay-client";

const credentials: RelayerParams = {
    apiKey: process.env.DEFENDER_RELAYER_API_KEY || "",
    apiSecret: process.env.DEFENDER_RELAYER_API_SECRET || ""
};
export const provider = new DefenderRelayProvider(credentials);
export const signer = new DefenderRelaySigner(credentials, provider, { speed: "fast" });
