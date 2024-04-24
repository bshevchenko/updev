import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { UpDevAccountNFT } from "../typechain-types";
import getSource from "../sources/get";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// TODO extract
const _LSP8_TOKEN_METADATA_BASE_URI = ethers.utils.arrayify(
  "0x1a7628600c3bac7101f53697f48df381ddc36b9015e7d7c9c5633d1252aa2843",
);
const _LSP4_ABI_DATA_KEY = ethers.utils.arrayify("0x4142495f44415441000000000000000000000000000000000000000000000000");
const _LSP4_TIMESTAMP_KEY = ethers.utils.arrayify("0x54494d455354414d500000000000000000000000000000000000000000000000");
const _LSP4_PROVIDER_KEY = ethers.utils.arrayify("0x50524f5649444552000000000000000000000000000000000000000000000000");
const _LSP4_VERSION_KEY = ethers.utils.arrayify("0x56455253494f4e00000000000000000000000000000000000000000000000000");
const _LSP4_ID_KEY = ethers.utils.arrayify("0x4944000000000000000000000000000000000000000000000000000000000000");

const OK = "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("upDevAccountNFT", () => {
  const source = getSource("test", "0.1");
  const accountId = "1283746192347";
  const ipfsHash = "QmP2Wpt6eCPrRkNjQmfDkvhdbgtC79ATHVz9Q1cBsY5WUR";

  let network: any;
  let isFork = false;

  let nft: UpDevAccountNFT;
  let signers: SignerWithAddress[];
  let owner: SignerWithAddress;
  let oracle: SignerWithAddress;
  const constructorArguments: any = [
    process.env.DON_ROUTER,
    process.env.DON_ID,
    process.env.LSP8_FORCE,
    process.env.DON_GAS_LIMIT,
  ];
  let tokenId: any;

  before(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];

    network = await ethers.provider.getNetwork();
    isFork = network.name === "unknown";

    if (isFork) {
      console.log("Fork. Impersonating DON router...");
      await impersonateAccount(process.env.DON_ROUTER || "");
      await setBalance(process.env.DON_ROUTER || "", ethers.utils.parseEther("1"));
      oracle = await ethers.getSigner(process.env.DON_ROUTER || "");
    }
  });

  it("Should deploy & add consumer to Chainlink router", async () => {
    if (!process.env.NFT) {
      const factory = await ethers.getContractFactory("upDevAccountNFT");
      nft = (await factory.deploy(...constructorArguments)) as UpDevAccountNFT;
      await nft.deployed();
      const router = await ethers.getContractAt("IChainlinkFunctionsRouter", process.env.DON_ROUTER || "");
      const tx = await router.addConsumer(process.env.DON_SUB_ID, nft.address);
      await tx.wait();
    } else {
      console.log("Reusing deployed upDevAccountNFT: ", process.env.NFT);
      nft = await ethers.getContractAt("upDevAccountNFT", process.env.NFT);
    }
  });

  it("Should add source & get available sources", async () => {
    const tx = await nft.addSource(source.name, source.code);
    await tx.wait();
    expect(await nft.getSources()).to.deep.equal([source.name]);
  });

  it("Shouldn't add source if name is already busy", async () => {
    await expect(nft.addSource(source.name, "")).to.be.revertedWithCustomError(nft, "SourceNameBusy");
  });

  it("Should send & fulfill request with error", async () => {
    const fulfilled: Promise<UpDevAccountNFT.RequestStruct> = new Promise(async resolve => {
      console.log("Subscribing to Fulfilled event...");
      nft.on("Fulfilled", async () => {
        console.log("Fulfilled");
        const requests = await nft.getPendingRequests(owner.address);
        resolve(requests[0]);
      });
      console.log("Sending request...");
      let tx = await nft.sendRequest(
        process.env.DON_SUB_ID || 0,
        0,
        source.provider,
        source.version,
        accountId,
        ipfsHash,
      );
      await tx.wait();
      console.log("Request sent and now being fulfilled by DON...");

      if (isFork) {
        const requestId = await nft.requests(owner.address, 0);
        console.log("Simulating DON fulfillment for:", requestId);
        tx = await nft.connect(oracle).handleOracleFulfillment(requestId, OK, "0x");
        await tx.wait();
      }
    });
    const request = await fulfilled;
    // nft.removeAllListeners("Fulfilled");
    expect(request.up).to.equal(owner.address);
    expect(request.provider).to.equal(source.provider);
    expect(request.version).to.equal(source.version);
    expect(request.id).to.equal(accountId);
    expect(request.ipfs).to.equal(ipfsHash);
    expect(request.isFulfilled).to.equal(true);
    expect(request.isOK).to.equal(true);
    expect(request.isClaimed).to.equal(false);
    expect(request.data).to.equal(OK);

    tokenId = request.tokenId;
  });

  it("Should mint", async () => {
    if (!isFork) {
      await hre.run("verify:verify", {
        address: nft.address,
        constructorArguments,
      });
    }

    console.log("Claiming token:", tokenId);
    const tx = await nft.claim(tokenId, { gasLimit: 20000000 });
    await tx.wait();

    expect(await nft.tokenOwnerOf(tokenId)).to.equal(owner.address);
    expect(await nft.tokenIdsOf(owner.address)).to.deep.equal([tokenId]);

    // TODO await expect(contract.call()).to.emit(contract, "Event")

    const [abiData, metaData, timestamp, provider, version, id] = await nft.getDataBatchForTokenIds(
      new Array(6).fill(tokenId),
      [
        _LSP4_ABI_DATA_KEY,
        _LSP8_TOKEN_METADATA_BASE_URI,
        _LSP4_TIMESTAMP_KEY,
        _LSP4_PROVIDER_KEY,
        _LSP4_VERSION_KEY,
        _LSP4_ID_KEY,
      ],
    );

    expect(abiData).to.equal(OK);
    expect(ethers.utils.toUtf8String(metaData)).to.equal("ipfs://" + ipfsHash);
    expect(ethers.utils.toUtf8String(provider)).to.equal(source.provider);
    expect(ethers.utils.toUtf8String(version)).to.equal(source.version);
    expect(ethers.utils.toUtf8String(id)).to.equal(accountId);

    const timestampDate = new Date(Number(ethers.utils.defaultAbiCoder.decode(["uint256"], timestamp)) * 1000);
    const now = new Date();
    const differenceInSeconds = (now.getTime() - timestampDate.getTime()) / 1000;
    expect(differenceInSeconds).to.be.lessThan(600);
  });

  it("Should not transfer/transferBatch (soulbound)", async () => {
    await expect(nft.transfer(owner.address, nft.address, tokenId, true, "0x")).to.be.revertedWithCustomError(
      nft,
      "Soulbound",
    );

    await expect(
      nft.transferBatch([owner.address], [nft.address], [tokenId], [true], ["0x"]),
    ).to.be.revertedWithCustomError(nft, "Soulbound");
  });

  it("Should transfer existing token to new address", async () => {
    const fulfilled: Promise<UpDevAccountNFT.RequestStruct> = new Promise(async resolve => {
      console.log("Subscribing to Fulfilled event...");
      const eventHandler = async () => {
        console.log("Fulfilled");
        const requests = await nft.getPendingRequests(signers[1].address);
        resolve(requests[0]);
      };
      nft.on("Fulfilled", eventHandler);
      console.log("Sending request...");
      let tx = await nft
        .connect(signers[1])
        .sendRequest(process.env.DON_SUB_ID || 0, 0, source.provider, source.version, accountId, ipfsHash);
      await tx.wait();
      console.log("Request sent and now being fulfilled by DON...");

      if (isFork) {
        console.log("Simulating DON fulfillment...");
        tx = await nft.connect(oracle).handleOracleFulfillment(await nft.requests(signers[1].address, 0), OK, "0x");
        await tx.wait();
        await eventHandler();
      }
    });
    const request = await fulfilled;
    // nft.removeAllListeners("Fulfilled");
    expect(tokenId).to.equal(request.tokenId);

    console.log("Claiming token: ", tokenId);
    const tx = await nft.claim(tokenId);
    await tx.wait();

    expect(await nft.tokenOwnerOf(tokenId)).to.equal(signers[1].address);
    expect(await nft.tokenIdsOf(owner.address)).to.deep.equal([]);
  });

  // TODO it should fulfill request – all providers? how? it won't work without OAuth keys.

  // TODO it should getRequests
  // TODO it should getPendingRequests
});
