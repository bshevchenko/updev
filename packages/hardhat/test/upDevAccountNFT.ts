import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";
import { UpDevAccountNFT } from "../typechain-types";
import getSource from "../sources/get";

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

  let nft: UpDevAccountNFT;
  let owner: any;
  const constructorArguments: any = [
    process.env.DON_ROUTER,
    process.env.DON_ID,
    process.env.LSP8_FORCE,
    process.env.DON_GAS_LIMIT,
  ];
  let tokenId: any;

  before(async () => {
    owner = (await ethers.getSigners())[0];
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
        console.log("Fetching pending requests...");
        const requests = await nft.getPendingRequests(owner.address);
        console.log("Pending requests:", requests);
        resolve(requests[0]);
      });
      console.log("Sending request...");
      const tx = await nft.sendRequest(
        process.env.DON_SUB_ID || 0,
        0,
        source.provider,
        source.version,
        accountId,
        ipfsHash,
      );
      await tx.wait();
      console.log("Request sent and now being fulfilled by DON...");
    });
    const request = await fulfilled;
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
    await hre.run("verify:verify", {
      address: nft.address,
      constructorArguments,
    });

    console.log("Claiming token:", tokenId);
    await nft.claim(tokenId, { gasLimit: 20000000 });

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
    const differenceInSeconds = Math.abs((now.getTime() - timestampDate.getTime()) / 1000);
    expect(differenceInSeconds).to.be.lessThan(60);
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

  // TODO it should fulfill request – all providers?

  // TODO it should getRequests
  // TODO it should getPendingRequests

  // TODO should transfer existing token to new address
});
