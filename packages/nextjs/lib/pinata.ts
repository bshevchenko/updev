import pinataSDK from "@pinata/sdk";

export default new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
