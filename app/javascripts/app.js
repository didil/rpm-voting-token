// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import {default as $} from 'jquery';


// Import our contract artifacts and turn them into usable abstractions.
import rpmcoin_artifacts from '../../build/contracts/RPMCoin.json'

// RPMCoin is our usable abstraction, which we'll use through the code below.
var RPMCoin = contract(rpmcoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function () {
    var self = this;

    // Bootstrap the RPMCoin abstraction for Use.
    RPMCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalances();
      self.refreshVotesToUse();
      self.refreshUpvotes();
      self.setAccountAddresses();
    });
  },

  setStatus: function (message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalances: function () {
    var self = this;

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;

      return Promise.all(
        [
          RPM.balanceOf.call(accounts[0], {from: account}),
          RPM.balanceOf.call(accounts[1], {from: account}),
          RPM.balanceOf.call(accounts[2], {from: account}),
          RPM.balanceOf.call(accounts[3], {from: account}),
          RPM.balanceOf.call(accounts[4], {from: account}),
        ]
      );
    }).then(function (values) {
      $(".account").each(function (i) {
        $(this).find('.balance').text(values[i]);
      });
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error getting balances; see log.");
    });
  },

  refreshVotesToUse: function () {
    var self = this;

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;

      return Promise.all(
        [
          RPM.votesToUse.call(accounts[0], {from: account}),
          RPM.votesToUse.call(accounts[1], {from: account}),
          RPM.votesToUse.call(accounts[2], {from: account}),
          RPM.votesToUse.call(accounts[3], {from: account}),
          RPM.votesToUse.call(accounts[4], {from: account}),
        ]
      );
    }).then(function (values) {
      $(".account").each(function (i) {
        $(this).find('.votes-to-use').text(values[i]);
      });
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error getting votesToUse; see log.");
    });
  },

  refreshUpvotes: function () {
    var self = this;

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;

      return Promise.all(
        [
          RPM.upvotesReceivedThisWeek.call(accounts[0], {from: account}),
          RPM.upvotesReceivedThisWeek.call(accounts[1], {from: account}),
          RPM.upvotesReceivedThisWeek.call(accounts[2], {from: account}),
          RPM.upvotesReceivedThisWeek.call(accounts[3], {from: account}),
          RPM.upvotesReceivedThisWeek.call(accounts[4], {from: account}),
        ]
      );
    }).then(function (values) {
      $(".account").each(function (i) {
        $(this).find('.upvotes').text(values[i]);
      });
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error getting upvotes; see log.");
    });
  },

  transfer: function () {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;
      return RPM.transferAndAddVoterAddress(receiver, amount, {from: account});
    }).then(function () {
      self.setStatus("Transaction complete!");
      self.refreshBalances();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  distributeVotes: function () {
    var self = this;

    var amount = parseInt(document.getElementById("votes-to-distribute").value);

    this.setStatus("Distributing votes ... (please wait)");

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;
      return RPM.distributeVotes(amount, {from: account,gas: 900000});
    }).then(function () {
      self.setStatus("Transaction complete!");
      self.refreshVotesToUse();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error distributing votes; see log.");
    });
  },

  distributeTokens: function () {
    var self = this;

    var amount = parseInt(document.getElementById("tokens-to-distribute").value);

    this.setStatus("Distributing tokens ... (please wait)");

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;
      return RPM.distributeTokens(amount, {from: account,gas: 900000});
    }).then(function () {
      self.setStatus("Transaction complete!");
      self.refreshBalances();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error distributing tokens; see log.");
    });
  },

  vote: function (i) {
    var self = this;

    this.setStatus("Voting ... (please wait)");

    var RPM;
    RPMCoin.deployed().then(function (instance) {
      RPM = instance;
      return RPM.vote(account, accounts[i] , {from: account,gas: 900000});
    }).then(function () {
      self.setStatus("Transaction complete!");
      self.refreshUpvotes();
      self.refreshVotesToUse();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error distributing tokens; see log.");
    });
  },

  setAccountAddresses: function () {
    $(".account").each(function (i) {
      $(this).find('.address').text(accounts[i]);
    });
  }
};


$(function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 RPMCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-MetaMask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to MetaMask for development. More info here: http://truffleframework.com/tutorials/truffle-and-MetaMask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
