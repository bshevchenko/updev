import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { UpDevAccountNFT } from "../typechain-types";
import getSource from "../sources/get";

const _LSP8_TOKEN_METADATA_BASE_URI = ethers.utils.arrayify(
  "0x1a7628600c3bac7101f53697f48df381ddc36b9015e7d7c9c5633d1252aa2843",
);
const _LSP4_ABI_DATA_KEY = ethers.utils.arrayify("0x4142495f44415441000000000000000000000000000000000000000000000000");
const _LSP4_TIMESTAMP_KEY = ethers.utils.arrayify("0x54494d455354414d500000000000000000000000000000000000000000000000");
const _LSP4_PROVIDER_KEY = ethers.utils.arrayify("0x50524f5649444552000000000000000000000000000000000000000000000000");
const _LSP4_VERSION_KEY = ethers.utils.arrayify("0x56455253494f4e00000000000000000000000000000000000000000000000000");
const _LSP4_ID_KEY = ethers.utils.arrayify("0x4944000000000000000000000000000000000000000000000000000000000000");

const OK = "0x0000000000000000000000000000000000000000000000000000000000000001";
const OK_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";

describe("upDevAccountNFT", () => {
  let network: any;
  let isFork = false;

  let nft: UpDevAccountNFT;
  let signers: SignerWithAddress[];
  let owner: SignerWithAddress;
  let oracle: SignerWithAddress;
  const constructorArguments: any = [
    process.env.DON_ROUTER,
    process.env.DON_ID,
    true,
    process.env.DON_GAS_LIMIT,
  ];
  let tokenId: any;
  const source = getSource("test/ok", "0.1");
  const accountId = "1283746192347";
  const ipfsHash = "QmP2Wpt6eCPrRkNjQmfDkvhdbgtC79ATHVz9Q1cBsY5WUR";
  const ipfsHash2 = "QmRuQ4xZ2UJWU8VP1dhvX1DBP5ZENjibEV82dSEmN2yQeZ";

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
    } else {
      expect(await signers[1].getBalance()).to.be.greaterThan(ethers.utils.parseEther("0.1"));
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
    nft.removeAllListeners("Fulfilled");
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
    const tx = await nft.claim(tokenId);
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

  it("Should update existing token & transfer it to new owner", async () => {
    const newSource = getSource("test/ok", "0.2");

    console.log("Adding source test/ok@0.2...");
    let tx = await nft.addSource(newSource.name, newSource.code);
    await tx.wait();

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
        .sendRequest(process.env.DON_SUB_ID || 0, 0, newSource.provider, newSource.version, accountId, ipfsHash2);
      await tx.wait();
      console.log("Request sent and now being fulfilled by DON...");

      if (isFork) {
        console.log("Simulating DON fulfillment...");
        tx = await nft.connect(oracle).handleOracleFulfillment(await nft.requests(signers[1].address, 0), OK_2, "0x");
        await tx.wait();
        await eventHandler();
      }
    });
    const request = await fulfilled;
    nft.removeAllListeners("Fulfilled");
    expect(tokenId).to.equal(request.tokenId);

    console.log("Claiming token: ", tokenId);
    tx = await nft.claim(tokenId);
    await tx.wait();

    expect(await nft.tokenOwnerOf(tokenId)).to.equal(signers[1].address);
    expect(await nft.tokenIdsOf(owner.address)).to.deep.equal([]);

    const [abiData, metaData, provider, version, id] = await nft.getDataBatchForTokenIds(new Array(5).fill(tokenId), [
      _LSP4_ABI_DATA_KEY,
      _LSP8_TOKEN_METADATA_BASE_URI,
      _LSP4_PROVIDER_KEY,
      _LSP4_VERSION_KEY,
      _LSP4_ID_KEY,
    ]);
    expect(abiData).to.equal(OK_2);
    expect(ethers.utils.toUtf8String(metaData)).to.equal("ipfs://" + ipfsHash2);
    expect(ethers.utils.toUtf8String(provider)).to.equal(source.provider);
    expect(ethers.utils.toUtf8String(version)).to.equal(newSource.version);
    expect(ethers.utils.toUtf8String(id)).to.equal(accountId);

    expect("0.2").to.equal(newSource.version);
  });

  it("should not claim failed request", async () => {
    const errorSource = getSource("test/error", "0.1");
    console.log("Adding source test/error@0.1...");
    const tx = await nft.addSource(errorSource.name, errorSource.code);
    await tx.wait();

    const expectedError = ethers.utils.toUtf8Bytes("test");

    const fulfilled: Promise<UpDevAccountNFT.RequestStruct> = new Promise(async resolve => {
      console.log("Subscribing to Fulfilled event...");
      const eventHandler = async () => {
        console.log("Fulfilled");
        const requests = await nft.getRequests(1, 1, owner.address);
        resolve(requests[0]);
      };
      nft.on("Fulfilled", eventHandler);
      console.log("Sending request...");
      let tx = await nft.sendRequest(
        process.env.DON_SUB_ID || 0,
        0,
        errorSource.provider,
        errorSource.version,
        accountId,
        ipfsHash,
      );
      await tx.wait();
      console.log("Request sent and now being fulfilled by DON...");

      if (isFork) {
        console.log("Simulating DON fulfillment...");
        tx = await nft
          .connect(oracle)
          .handleOracleFulfillment(await nft.requests(owner.address, 1), "0x", expectedError);
        await tx.wait();
        await eventHandler();
      }
    });
    const request: any = await fulfilled;
    nft.removeAllListeners("Fulfilled");
    expect(request.up).to.equal(owner.address);
    expect(request.provider).to.equal(errorSource.provider);
    expect(request.version).to.equal(errorSource.version);
    expect(request.id).to.equal(accountId);
    expect(request.ipfs).to.equal(ipfsHash);
    expect(request.isFulfilled).to.equal(true);
    expect(request.isOK).to.equal(false);
    expect(request.isClaimed).to.equal(false);
    expect(ethers.utils.toUtf8String(request.data)).to.equal("test");
  });
});
