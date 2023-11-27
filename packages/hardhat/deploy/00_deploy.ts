import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

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
    await collection.transferOwnership(consumer.address);
    console.log('Collection ownership transferred to', consumer.address);
  } catch (e) {
    console.log("Collection ownership already transferred");
  }

  // await consumer.sendRequest(877, "0x", 0, 0, "github", "0x240588cebbd7c2f7e146a9fc1f357c82a9c052dc", "bshevchenko");

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
