import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getSourceCode from "../sources/get";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("upRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  // const upRegistry = await hre.ethers.getContract("upRegistry", deployer);

  await deploy("upDevAccountOwnership", {
    from: deployer,
    args: ["Account Ownership", "UPDEV", deployer],
    log: true,
    autoMine: true,
  });
  const collection = await hre.ethers.getContract("upDevAccountOwnership", deployer);

  await deploy("upDevFunctionsConsumer", {
    from: deployer,
    args: [process.env.DON_ROUTER, process.env.DON_ID, collection.address],
    log: true,
    autoMine: true,
  });
  const consumer = await hre.ethers.getContract("upDevFunctionsConsumer", deployer);

  // Register Chainlink Functions consumer
  try {
    const router = await hre.ethers.getContractAt("IChainlinkFunctionsRouter", process.env.DON_ROUTER || "", deployer);
    const [isAdded] = await router.getConsumer(consumer.address, process.env.DON_SUB_ID);
    if (isAdded) {
      throw new Error("skip");
    }
    const tx = await router.addConsumer(process.env.DON_SUB_ID, consumer.address);
    console.log("Adding consumer...", consumer.address);
    await tx.wait();
    console.log("Consumer added");
  } catch (e) {
    console.log("Consumer already added");
  }

  // Transfer NFT collection ownership to consumer contract
  try {
    await collection.transferOwnership(consumer.address);
    console.log("Collection ownership transferred to", consumer.address);
  } catch (e) {
    const owner = await collection.owner();
    const consumerAddress = await consumer.resolvedAddress;
    if (owner !== consumerAddress) {
      console.error("Collection owner is invalid: ", owner, "Must be", consumer.address);
      return;
    } else {
      console.log("Collection ownership already transferred");
    }
  }

  const addSource = async (name: string) => {
    try {
      await consumer.addSource(name, getSourceCode(name));
      console.log(`Source ${name} added`);
    } catch (e) {
      console.log(`Source ${name} already added`);
    }
  };

  await addSource("twitter");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["core"];
