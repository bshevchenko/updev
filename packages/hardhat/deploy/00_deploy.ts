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

  console.log("consumer.sendRequest( github )...");
  const tx = await consumer.sendRequest(
    subId,
    "0xfd4b538303d011a1ee86361cf33af34803dddef3d4a9ebbe9b5a3e61e58d3625d4ae1abcdb4c48845182373d3115ac9639956c1df6723d66bb5ff713061605ffbe2e7e7f1e75a186a5e0db36723cc979af7ca318fa034e1eddbcc2711adcc1bd4f6c5f6702587e05aa721b011c1c5f0dfee6f8fb0dcbbbef414eb7776a1e93ad7c69b317d03f4fe080704397ef7ff702b516653c2314bb1753345703e63b0e82bf",
    0,
    0,
    "github",
    "0x7885f82e19e5950129cB78356C56DD571E792508",
    "bshevchenko",
    { gasPrice: 2850069165 },
  );
  tx.wait().then(() => {
    console.log("consumer.sendRequest( github ) waiting for Response...");
  });
  console.log("consumer.sendRequest( buidlguidl )...");
  const tx2 = await consumer.sendRequest(
    subId,
    "0x",
    0,
    0,
    "buidlguidl",
    "0x7885f82e19e5950129cB78356C56DD571E792508",
    "0x240588CeBBd7C2f7e146A9fC1F357C82A9C052DC",
    { gasPrice: 2850069165 },
  );
  tx2.wait().then(() => {
    console.log("consumer.sendRequest( buidlguidl ) waiting for Response...");
  });

  consumer.on("Response", async (requestId, up, isOwned, source, id, data) => {
    let types;
    if (source === "github") {
      types = ["uint32", "uint32", "uint32"];
    } else {
      types = ["uint32", "uint32", "uint32", "uint32"];
    }
    const result = hre.ethers.utils.defaultAbiCoder.decode(types, data);
    console.log(`${source} - ${id} - ${isOwned} - ${up} - ${requestId}`, result);
    const tokenId = hre.ethers.utils.solidityKeccak256(["string", "string"], [source, id]);
    try {
      await consumer.claimToken(tokenId);
    } catch (e: any) {
      if (e.message.includes("replacement fee too low")) {
        await wait(3000);
        await consumer.claimToken(tokenId);
      }
    }

    console.log(`${source} - ${id} token claimed`);
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
