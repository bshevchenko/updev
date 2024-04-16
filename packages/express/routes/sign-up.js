const axios = require("axios")
const { DefenderRelaySigner, DefenderRelayProvider } = require('@openzeppelin/defender-relay-client/lib/ethers')
const { ethers } = require('ethers');

// TODO duplicates in hardhat/deploy/00_LSP23.ts
const LSP23_FACTORY_ADDRESS = "0x2300000a84d25df63081feaa37ba6b62c4c89a30";

// TODO get from deployedContracts
const UP_REGISTRY_ADDRESS = "0x4D820F82d44DF73011A3d10F39545a577A253d2a";

// TODO make sure artifacts are compiled
const LSP23_FACTORY_ABI = require("../../hardhat/artifacts/@lukso/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol/LSP23LinkedContractsFactory.json").abi
const UP_REGISTRY_ABI = require("../../hardhat/artifacts/contracts/upRegistry.sol/upRegistry.json").abi

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

module.exports = async function (req, res) {

    // TODO COMMON Controller Auth for all routes. Rate limits?

    // TODO throw error if controllerAddress is already in upRegistry
    const controller = req.body.controller;

    // TODO bytecode; waiting for reply from Magali. pass via req.body.profile
    const lsp3Profile = "0x6f357c6a3e2e3b435dd1ee4b8a2435722ee5533ea3f6cf6cb44c7fc278ac57ea1480295e697066733a2f2f516d5861714d67646971664b7931384373574768534a4c62626136316f6676666857387175506e6e6a6e76625966";

    const { data } = await axios.post("https://relayer-api.testnet.lukso.network/v1/relayer/universal-profile", { // TODO testnet url
        lsp6ControllerAddress: [controller],
        lsp3Profile
    }, {
        headers: {
            "Authorization": "Bearer " + process.env.LUKSO_RELAYER_API_KEY,
            "Content-Type": "application/json"
        }
    })

    // TODO Explorer API takes some time to get new tx data. I asked Magali to include deployment data in Relayer API response
    await delay(5000);

    // TODO use Lukso Explorer API to get deployment data
    const { data: { decoded_input: { parameters } } } = await axios.get(
        // TODO testnet url
        "https://explorer.execution.testnet.lukso.network/api/v2/transactions/" + data.transactionHash
    )

    // TODO deploy created UP on Sepolia via Defender gas relayer

    const credentials = {
        apiKey: process.env.DEFENDER_RELAYER_API_KEY,
        apiSecret: process.env.DEFENDER_RELAYER_API_SECRET
    };

    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

    const lsp23Factory = new ethers.Contract(LSP23_FACTORY_ADDRESS, LSP23_FACTORY_ABI, signer);
    const lsp23Tx = await lsp23Factory.deployERC1167Proxies(
        parameters[0].value,
        parameters[1].value,
        parameters[2].value,
        parameters[3].value,
    );
    const lsp23TxMined = await lsp23Tx.wait();
    console.log('lsp23TxMined', lsp23TxMined);

    const upRegistry = new ethers.Contract(UP_REGISTRY_ADDRESS, UP_REGISTRY_ABI, signer);
    const upRegistryTx = await upRegistry.setUP(data.universalProfileAddress, controller);
    const upRegistryTxMined = await upRegistryTx.wait();
    console.log('upRegistryTxMined', upRegistryTxMined);

    console.log('Deployed UP', data.universalProfileAddress);

    // TODO return
}
