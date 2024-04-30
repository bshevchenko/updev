import pinataSDK from "@pinata/sdk";

// TODO free pinata tier has only 500 Pinned Files max. Filebase? Infura?
export default new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
