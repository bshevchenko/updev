export const convertIpfsUrl = (ipfsUrl: string) => {
  // Replace this with the IPFS gateway you want to use
  const ipfsGateway = "https://ipfs.io/ipfs/";
  return ipfsUrl.replace("ipfs://", ipfsGateway);
};
