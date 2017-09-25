pragma solidity ^0.4.8;


import "./StandardToken.sol";


contract RPMCoin is StandardToken {
    address public contractOwner;

    mapping (address => uint) public votesToUse;

    mapping (address => uint) public upvotesReceivedThisWeek;

    address[] public voterAddresses;
    address[] public projectAddresses;

    mapping (address => bool) voterAddressInitialized;

    function RPMCoin(uint256 _totalSupply) {
        totalSupply = _totalSupply;
        contractOwner = tx.origin;

        balances[contractOwner] = totalSupply;
        addVoterAddress(contractOwner);
    }

    function transferAndAddVoterAddress(address _to, uint256 _value){
        transfer(_to, _value);
        addVoterAddress(_to);
    }

    function addVoterAddress(address _address) internal {
        if (!voterAddressInitialized[_address]) {
            voterAddresses.push(_address);
        }
    }

    function distributeVotes(uint votesToDistribute){
        require(tx.origin == contractOwner);
        require(votesToDistribute > 0);

        for (uint i = 0; i < voterAddresses.length; i++) {
            address voterAddress = voterAddresses[i];
            votesToUse[voterAddress] += (balanceOf(voterAddress) * votesToDistribute) / totalSupply;
        }
    }

    function vote(address voterAddress, address projectAddress){
        require(tx.origin == voterAddress);
        require(votesToUse[voterAddress] >= 1);

        upvotesReceivedThisWeek[projectAddress] += 1;
        votesToUse[voterAddress] -= 1;
    }
}