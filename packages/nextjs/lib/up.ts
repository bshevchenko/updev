import axios from "axios";

type DeploymentData = {
  value: string;
};

const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export const getDeploymentData = async (txHash: string, attempt = 1): Promise<DeploymentData[]> => {
  if (attempt > 10) {
    throw new Error("couldn't retrieve deployment data");
  }
  // TODO Explorer API takes some time to get new tx data. Lukso will include deployment data in Relayer API response
  await delay(1000);
  console.log("Get Deployment Data... Attempt #" + attempt);
  try {
    const {
      data: {
        decoded_input: { parameters },
      },
    } = await axios.get(process.env.LUKSO_EXPLORER_URL + "/api/v2/transactions/" + txHash);
    return parameters;
  } catch (e) {
    return getDeploymentData(txHash, attempt + 1);
  }
};
