var RPMCoin = artifacts.require("./RPMCoin.sol");

module.exports = function (deployer) {
  deployer.deploy(RPMCoin, 10000);
};
