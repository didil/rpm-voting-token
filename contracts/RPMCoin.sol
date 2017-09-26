pragma solidity ^0.4.11;


import "./StandardToken.sol";


contract RPMCoin is StandardToken {
    address public contractOwner;

    mapping (address => uint) public votesToUse;

    mapping (address => uint) public upvotesReceivedThisWeek;

    uint public totalUpvotesReceivedThisWeek;

    address[] public voterAddresses;

    address[] public projectAddresses;

    mapping (address => bool) voterAddressInitialized;

    mapping (address => bool) projectAddressInitialized;

    modifier onlyOwner()
    {
        require(msg.sender == contractOwner);
        _;
    }

    function RPMCoin(uint256 _totalSupply) {
        totalSupply = _totalSupply;
        contractOwner = msg.sender;

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

    function addProjectAddress(address _address) internal {
        if (!projectAddressInitialized[_address]) {
            projectAddresses.push(_address);
        }
    }

    function distributeVotes(uint votesToDistribute) onlyOwner {
        require(votesToDistribute > 0);

        for (uint i = 0; i < voterAddresses.length; i++) {
            address voterAddress = voterAddresses[i];
            votesToUse[voterAddress] += (balanceOf(voterAddress) * votesToDistribute) / totalSupply;
        }
    }

    function vote(address voterAddress, address projectAddress){
        require(msg.sender == voterAddress);
        require(votesToUse[voterAddress] >= 1);

        addProjectAddress(projectAddress);
        upvotesReceivedThisWeek[projectAddress] += 1;
        votesToUse[voterAddress] -= 1;
        totalUpvotesReceivedThisWeek += 1;
    }

    function distributeTokens(uint newTokens) onlyOwner {
        require(newTokens > 0);

        uint previousOwnerBalance = balanceOf(contractOwner);

        increaseSupply(newTokens, contractOwner);

        for (uint i = 0; i < projectAddresses.length; i++) {
            address projectAddress = projectAddresses[i];
            uint tokensToTransfer = (upvotesReceivedThisWeek[projectAddress] * newTokens) / totalUpvotesReceivedThisWeek;
            transferAndAddVoterAddress(projectAddress, tokensToTransfer);
            upvotesReceivedThisWeek[projectAddress] = 0;
        }

        totalUpvotesReceivedThisWeek = 0;

        // make sure we didn't redistribute more tokens than created
        assert(balanceOf(contractOwner) >= previousOwnerBalance);
    }

    function increaseSupply(uint value, address to) onlyOwner returns (bool) {
        totalSupply = safeAdd(totalSupply, value);
        balances[to] = safeAdd(balances[to], value);
        Transfer(0, to, value);
        return true;
    }

    function safeAdd(uint a, uint b) internal returns (uint) {
        require(a + b >= a);
        return a + b;
    }

}