import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const subId = 877;

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
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
    args: [collection.address],
    log: true,
    autoMine: true,
  });
  const consumer = await hre.ethers.getContract("upDevFunctionsConsumer", deployer);

  try {
    const router = await hre.ethers.getContractAt(
      "IChainlinkFunctionsRouter",
      "0x6e2dc0f9db014ae19888f539e59285d2ea04244c", // polygon mumbai router
      deployer,
    );
    const [isAdded] = await router.getConsumer(consumer.address, subId);
    if (isAdded) {
      throw new Error("skip");
    }
    const tx = await router.addConsumer(subId, consumer.address, { gasPrice: 2850069165 });
    console.log("Adding consumer...", consumer.address);
    await tx.wait();
    console.log("Consumer added");
  } catch (e) {
    console.log("Consumer already added");
  }

  try {
    await collection.transferOwnership(consumer.address);
    console.log("Collection ownership transferred to", consumer.address);
  } catch (e) {
    console.log("Collection ownership already transferred");
  }

  console.log("consumer.sendRequest( twitter )...");
  const tx = await consumer.sendRequest(
    subId,
    "0x7dda7eb55a0adf7779245bc7d23e0bf20230e07bbfdf53efb667834d7c16f78aed1982f32f83f166bdc90bb2c163b96d500199b196dca3225dc34f99e5751feaf557f3953c7099703a0fadfe2bad93bb83508f9d656296937a7c76698e082eaf7e13dfc4a1776c436c40326a78a831af58e6fc584de64272504189dbf0319fe9b33e01d0108b70d243dfedbc65f6eccb360f05e06120f46e075c68393f7a81b630",
    0,
    0,
    "twitter",
    "QmRtZ6w4Q9KKZ6xdW5F8xS1592NgrMhcUqFK7K4TqqJsTW", // IPFS HASH
    "updevonly",
    { gasPrice: 2850069165 },
  );
  tx.wait().then(() => {
    console.log("consumer.sendRequest( twitter ) waiting for Response...");
  });
  // console.log("consumer.sendRequest( buidlguidl )...");
  // const tx2 = await consumer.sendRequest(
  //   subId,
  //   "0x",
  //   0,
  //   0,
  //   "buidlguidl",
  //   "0x659278cb0106DB2fB1C840775CAc743a9703C22A",
  //   "0x240588CeBBd7C2f7e146A9fC1F357C82A9C052DC",
  //   { gasPrice: 2850069165 },
  // );
  // tx2.wait().then(() => {
  //   console.log("consumer.sendRequest( buidlguidl ) waiting for Response...");
  // });
  // github – 0x18D79f0AAB8e759CFA848fd0091c57614DD690B2 – timofeevs
  // github – 0x659278cb0106DB2fB1C840775CAc743a9703C22A – MattPereira
  // buidlguidl – 0x659278cb0106DB2fB1C840775CAc743a9703C22A – 0x41f727fA294E50400aC27317832A9F78659476B9

  consumer.on("Response", async (requestId, up, isOwned, source, id, ipfs, data) => {
    console.log("requestId", requestId);
    console.log("up", up);
    console.log("isOwned", isOwned);
    console.log("source", source);
    console.log("id", id);
    console.log("ipfs", ipfs);
    console.log("data", data);

    // let types;
    // if (source === "github") {
    //   types = ["uint32", "uint32", "uint32"];
    // } else {
    //   types = ["uint32", "uint32", "uint32", "uint32"];
    // }
    // const result = hre.ethers.utils.defaultAbiCoder.decode(types, data);
    // console.log(`${source} - ${id} - ${isOwned} - ${up} - ${requestId}`, result);
    // const tokenId = hre.ethers.utils.solidityKeccak256(["string", "string"], [source, id]);
    // try {
    //   await consumer.claimToken(tokenId);
    // } catch (e: any) {
    //   if (e.message.includes("replacement fee too low")) {
    //     await wait(3000);
    //     await consumer.claimToken(tokenId);
    //   }
    // }
    // console.log(`${source} - ${id} token claimed`);
  });

  await wait(60000);

  // TODO wait for Response and claim tokens after

  // await deploy("LSP23LinkedContractsFactory", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: [],
  //   log: true,
  //   autoMine: true,
  // });

  // Get the deployed contract
  // const lsp23 = await hre.ethers.getContract("LSP23LinkedContractsFactory", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["LSP23LinkedContractsFactory"];
