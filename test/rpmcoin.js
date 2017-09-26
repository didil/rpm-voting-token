var RPMCoin = artifacts.require("./RPMCoin.sol");

function catchOpcodeErr(err) {
  if (err.toString().indexOf("invalid opcode") < 0) {
    assert(false, err.toString());
  }
}

contract('RPMCoin', function (accounts) {
  it("should put 10000 RPMCoin in the first account", function () {
    var instance;

    return RPMCoin.deployed().then(function (_instance) {
      instance = _instance;
      return instance.balanceOf.call(accounts[0]);
    }).then(balance => {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    }).then(function () {
      return instance.voterAddresses.call(0);
    }).then(function (address) {
      assert.equal(address, accounts[0], "Owner address not added to voters list");
    });
  });

  it("should send coin correctly and address to voters list", function () {
    var instance;

    //    Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 4000;

    return RPMCoin.deployed().then(function (_instance) {
      instance = _instance;
      return instance.balanceOf.call(account_one);
    }).then(function (balance) {
      account_one_starting_balance = balance.toNumber();
      return instance.balanceOf.call(account_two);
    }).then(function (balance) {
      account_two_starting_balance = balance.toNumber();
      return instance.transferAndAddVoterAddress(account_two, amount, {from: account_one});
    }).then(function () {
      return instance.balanceOf.call(account_one);
    }).then(function (balance) {
      account_one_ending_balance = balance.toNumber();
      return instance.balanceOf.call(account_two);
    }).then(function (balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, 6000, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, 4000, "Amount wasn't correctly sent to the receiver");
    }).then(function () {
      return instance.voterAddresses.call(1);
    }).then(function (address) {
      assert.equal(address, account_two, "Receiver address no added to voters list");
    });
  });

  describe("distributeVotes", function () {
    it("not allowed if not owner", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.distributeVotes(100, {from: accounts[1]});
      }).then(assert.fail).catch(catchOpcodeErr);
    });

    it("increases votesToUse", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.distributeVotes(100, {from: accounts[0]});
      }).then(function () {
        return instance.votesToUse.call(accounts[0]);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 60, "Votes not distributed properly to account 1");
      }).then(function () {
        return instance.votesToUse.call(accounts[1]);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 40, "Votes not distributed properly to account 2");
      });
    });
  });

  describe("vote", function () {
    let project1Address = accounts[1];
    let project2Address = accounts[2];

    it("not allowed if not owner", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.vote(accounts[0], project1Address, {from: accounts[1]});
      }).then(assert.fail).catch(catchOpcodeErr);
    });

    it("upvotes", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.vote(accounts[0], project1Address, {from: accounts[0]});
      }).then(function () {
        return instance.vote(accounts[0], project2Address, {from: accounts[0]});
      }).then(function () {
        return instance.votesToUse.call(accounts[0]);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 58, "Votes not decreased properly");
      }).then(function () {
        return instance.upvotesReceivedThisWeek.call(project1Address);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 1, "Upvotes not increased properly");
      }).then(function () {
        return instance.upvotesReceivedThisWeek.call(project2Address);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 1, "Upvotes not increased properly");
      }).then(function () {
        return instance.vote(accounts[1], project1Address, {from: accounts[1]});
      }).then(function () {
        return instance.votesToUse.call(accounts[1]);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 39, "Votes not decreased properly");
      }).then(function () {
        return instance.upvotesReceivedThisWeek.call(project1Address);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 2, "Upvotes not increased properly");
      }).then(function () {
        return instance.upvotesReceivedThisWeek.call(project2Address);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 1, "Upvotes should not be increased");
      }).then(function () {
        return instance.totalUpvotesReceivedThisWeek.call();
      }).then(function (totalVotes) {
        assert.equal(totalVotes.toNumber(), 3, "Total Upvotes not increased properly");
      });
    });

  });

  describe("increaseSupply", function () {

    it("not allowed if not owner", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.increaseSupply(2000, accounts[1], {from: accounts[1]});
      }).then(assert.fail).catch(catchOpcodeErr);
    });

    it("increases supply", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.balanceOf.call(accounts[0]);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), 6000, "Initial Balance invalid");
      }).then(function () {
        return instance.increaseSupply(2000, accounts[0], {from: accounts[0]});
      }).then(function () {
        return instance.totalSupply.call();
      }).then(function (totalSupply) {
        assert.equal(totalSupply.toNumber(), 12000, "Total Supply not increased properly");
      }).then(function () {
        return instance.balanceOf.call(accounts[0]);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), 8000, "Balance not increased properly");
      });
    });

  });

  describe("distributeTokens", function () {
    let project1Address = accounts[1];
    let project2Address = accounts[2];

    it("not allowed if not owner", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.distributeTokens(3000, {from: accounts[1]});
      }).then(assert.fail).catch(catchOpcodeErr);
    });

    it("distributes tokens", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.distributeTokens(3000,  {from: accounts[0]});
      }).then(function () {
        return instance.totalSupply.call();
      }).then(function (totalSupply) {
        assert.equal(totalSupply.toNumber(), 15000, "Total Supply not increased properly");
      }).then(function () {
        return instance.balanceOf.call(accounts[0]);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), 8000, "Balance invalid");
      }).then(function () {
        return instance.balanceOf.call(accounts[1]);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), 6000, "Balance invalid");
      }).then(function () {
        return instance.balanceOf.call(accounts[2]);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), 1000, "Balance invalid");
      }).then(function () {
        return instance.upvotesReceivedThisWeek.call(project1Address);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 0, "Upvotes should be reset");
      }).then(function () {
        return instance.upvotesReceivedThisWeek.call(project2Address);
      }).then(function (votes) {
        assert.equal(votes.toNumber(), 0, "Upvotes should be reset");
      }).then(function () {
        return instance.totalUpvotesReceivedThisWeek.call();
      }).then(function (totalVotes) {
        assert.equal(totalVotes.toNumber(), 0, "Total Upvotes not reset properly");
      });
    });

  });


  describe("burn", function () {

    it("not allowed if not owner", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.burn(1000, {from: accounts[1]});
      }).then(assert.fail).catch(catchOpcodeErr);
    });

    it("burn", function () {
      var instance;

      return RPMCoin.deployed().then(function (_instance) {
        instance = _instance;
        return instance.burn(1000, {from: accounts[0]});
      }).then(function () {
        return instance.totalSupply.call();
      }).then(function (totalSupply) {
        assert.equal(totalSupply.toNumber(), 14000, "Total Supply not decreased properly");
      }).then(function () {
        return instance.balanceOf.call(accounts[0]);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), 7000, "Balance not decreased properly");
      });
    });

  });



});