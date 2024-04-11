import fs from "fs";
import path from "path";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const subId = 877; // TODO extract

const wait = (sec: number) => new Promise(resolve => setTimeout(resolve, sec * 1000));

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
    args: [collection.address],
    log: true,
    autoMine: true,
  });
  const consumer = await hre.ethers.getContract("upDevFunctionsConsumer", deployer);

  // Register Chainlink Functions consumer
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
    const tx = await router.addConsumer(subId, consumer.address);
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
      const source = fs.readFileSync(path.resolve(__dirname + "/../sources/", name + ".js"), "utf8");
      await consumer.addSource(name, source);
      console.log(`Source ${name} added`);
    } catch (e) {
      console.log(`Source ${name} already added`);
    }
  };

  await addSource("twitter");

  // TODO remove and uncomment below
  // const id = "0x44f506f0f6e907a222ef2fc36e7b0898717c3af76c28621654e5e6b129e5f77d";
  // try {
  //   await consumer.claimToken(id, { gasLimit: 5000000 });
  //   console.log(`twitter - ${id} token claimed by ME`);
  // } catch (e: any) {
  //   console.error('Claim token failed', id, e)
  // }

  console.log("consumer.sendRequest( twitter )...");
  const tx = await consumer.sendRequest(
    subId,
    "0xf32e7882d6aca82cd3ab60ecb182b81203e9f726650b7dd32dc2f0ed4cb23a01db00e8c3295f4b06e184068bd6d94f4317ef38a3a8567a3d00bb4a3e2a9a38079b15fdb82101564ff269a867ace4842833b10f2b10b86e764e219338c9c29a3d9e5b0e1bdf1aa7d665219a9dfed3d6e07959184335d3691371c2ccded8dcfcd5b1a1b514491b7aa32f9d2de265216f88389d9aa5f7e01c9df50d02636741ef5561",
    0,
    0,
    "twitter",
    "QmP2Wpt6eCPrRkNjQmfDkvhdbgtC79ATHVz9Q1cBsY5WUR", // IPFS HASH
    "BorisShevc64479",
  );
  tx.wait().then(() => {
    console.log("consumer.sendRequest( twitter ): waiting for Response...");
  });

  consumer.on("Response", async (id, request) => {
    if (!request.isOwned) {
      console.log("Request failed", request);
      return;
    }
    try {
      await consumer.claimToken(request.tokenId);
      console.log(`${request.source} - ${id} token claimed by ${request.up}`);
    } catch (e: any) {
      if (e.message.includes("replacement fee too low")) {
        await wait(3000);
        await consumer.claimToken(request.tokenId);
      } else {
        console.error("Claim token failed", request.tokenId, e);
      }
    }
  });

  await wait(100);

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
