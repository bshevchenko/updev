import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import axios from "axios";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signer = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || "", hre.ethers.provider);

  // For more information check: https://github.com/Arachnid/deterministic-deployment-proxy
  const NICK_FACTORY_ADDRESS = "0x4e59b44847b379578588920ca78fbf26c0b4956c";

  const LSP23_FACTORY_ADDRESS = "0x2300000a84d25df63081feaa37ba6b62c4c89a30";
  const UP_INIT_POST_ADDRESS = "0x000000000066093407b6704b89793beffd0d8f00";
  const UP_INIT_ADDRESS = "0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F";
  const KEY_MANAGER_INIT_ADDRESS = "0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4";
  const LSP1_URD_ADDRESS = "0x7870C5B8BC9572A8001C3f96f7ff59961B23500D";

  if ((await hre.ethers.provider.getCode(NICK_FACTORY_ADDRESS)) == "0x") {
    const fundingTx = await signer.sendTransaction({
      // Standardized address
      to: "0x3fab184622dc19b6109349b94811493bf2a45362",
      value: hre.ethers.utils.parseEther("0.009"), // This value should be enough
      // Check gasLimit and gasPrice to estimate exactly the value: https://github.com/Arachnid/deterministic-deployment-proxy
    });
    await fundingTx.wait();

    // Sending raw transaction specified by the Nick factory
    const rawTx =
      "0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222";
    const deployNickFactoryTx = await hre.ethers.provider.send(rawTx, []);
    // const deployNickFactoryTx = await hre.ethers.provider.broadcastTransaction(rawTx);
    await deployNickFactoryTx.wait();
    console.log("Nick deployed");
  }

  const checkDeployedCode = async (address: string, name: string) => {
    const code = await hre.ethers.provider.getCode(address);
    if (code == "0x") {
      const result = await axios.get(
        "https://explorer.execution.testnet.lukso.network/api/v2/smart-contracts/" + address,
      );
      const data = result.data.creation_bytecode.replace(
        "0x",
        "0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed",
      );
      const tx = await signer.sendTransaction({
        to: NICK_FACTORY_ADDRESS,
        data,
      });
      await tx.wait();
    }
    console.log(name, "is deployed");
  };

  await checkDeployedCode(NICK_FACTORY_ADDRESS, "Nick Factory");
  await checkDeployedCode(LSP23_FACTORY_ADDRESS, "LSP23 Factory");
  await checkDeployedCode(KEY_MANAGER_INIT_ADDRESS, "Key Manager");
  await checkDeployedCode(UP_INIT_POST_ADDRESS, "UP Post Deployment Module");
  await checkDeployedCode(UP_INIT_ADDRESS, "UP Init");
  await checkDeployedCode(LSP1_URD_ADDRESS, "LSP1 URD");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["LSP23"];
