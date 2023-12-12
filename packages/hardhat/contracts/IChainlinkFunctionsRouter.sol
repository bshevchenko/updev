pragma solidity ^0.8.20;

interface IChainlinkFunctionsRouter {
	function addConsumer(uint64 subId, address consumer) external;
	function getConsumer(address consumer, uint64 subId) external view;
}
