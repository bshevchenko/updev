pragma solidity ^0.8.20;

interface IChainlinkFunctionsRouter {
	function addConsumer(uint64 subId, address consumer) external;
}
