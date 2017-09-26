# RPM Voting Token


This is the  proof of concept of an ERC20 Voting Token with the following specs :
* Addresses hold the token and can transfer it 
* The owner can call distributeVotes to distribute votes proportionally amongst token owners
* The token holders can use those votes to vote on projects (addresses)
* The owner can call distributeTokens to create and distribute tokens proportionally amongst the projects proportionally to the votes received
* The owner can burn tokens

This project is built using Truffle (with Node v6) and provides mocha unit tests as well as a basic Html/JS frontend to interact with the contract deployed on the local Ethereum blockchain (via testrpc)

## Limitations
* distributeVotes/distributeTokens currently use a naive loop which might run out of gas
* distributeVotes/distributeTokens need to be called periodically by the owner and do not run based on a scheduler

## Installation steps
Install dependencies 
```` 
npm install
````
Run TestRpc
```` 
testrpc
````
Run Truffle migrations
```` 
truffle migrate
````
(Optional) Run tests
```` 
truffle test
````
Run Dev Server, then the frontend will be available at http://localhost:8080
```` 
truffle run dev
````
