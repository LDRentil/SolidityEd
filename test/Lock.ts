import {loadFixture, ethers, expect, HardhatEthersSigner, time} from "./setup";
import {Vote} from "../typechain-types";
import {RToken} from "../typechain-types";

describe("Vote", function () {
 async function deploy(): Promise<{
     user1:HardhatEthersSigner;
     user2:HardhatEthersSigner;
     vote:Vote;
     rt:RToken;
 }>{
     const Factory = await  ethers.getContractFactory("Vote");
     const Token = await  ethers.getContractFactory("RToken");
     const  vote = await Factory.deploy();

     await vote.waitForDeployment();

     const  [user1, user2] = await ethers.getSigners();
     const rt = await Token.deploy("RToken","RT", 18);

     return { user1, user2,vote, rt}
 }
 it("should be deployed", async function() {
     const {vote, rt} = await loadFixture(deploy);

     expect(vote.target).to.be.properAddress;
     expect(rt.target).to.be.properAddress;
    });

 it('should faild startVoteTime', async function() {
        const {vote} = await loadFixture(deploy);

        const block = await ethers.provider.getBlock("latest");
        const proposal = "Test proposla";
        const tx = vote._createProposal(proposal,  block?.timestamp+1 , block?.timestamp+31);

        await expect(tx).to.revertedWith("Start timestamp invalid");
    });

 it('should faild endVoteTime', async function() {
     const {vote} = await loadFixture(deploy);

     const block = await ethers.provider.getBlock("latest");
     const proposal = "Test proposla";
     const tx = vote._createProposal(proposal,  block?.timestamp+31 , block?.timestamp+1);

     await expect(tx).to.revertedWith("End timestamp invalid");
    });

 it('shold be create newProposal', async function() {
     const {vote} = await loadFixture(deploy);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     const tx = vote._createProposal(proposal,  block?.timestamp+101 , block?.timestamp+131);

     await expect(tx).to.emit(vote, "newProposal").withArgs(0, proposal, block?.timestamp+101, block?.timestamp+131);
    });

 it('shold be push ', async function() {
     const {vote} = await loadFixture(deploy);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+101 , block?.timestamp+131);

     const _proposal = await vote.getProposal(0);

     expect(_proposal.proposal).to.eq(proposal);
     expect(_proposal.startVoteTime).to.eq(block?.timestamp+101)
     expect(_proposal.endVoteTime).to.eq(block?.timestamp+131);
     expect(_proposal.positiveVotes).to.eq(0);
     expect(_proposal.negativeVotes).to.eq(0);
    });

 it('shold vote For', async function () {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 1);
     await rt.connect(user1).approve(vote.getAddress(), 1);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+301 , block?.timestamp+331);

     await time.increase(316);
     await vote.voteFor(0, 1, rt.getAddress());

     const _proposal = await vote.getProposal(0);

     expect(_proposal.positiveVotes).to.eq(1);
     expect(await vote.hasVoted(0,user1)).to.eq(true);
 });

 it('shold vote Against', async function () {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 1);
     await rt.connect(user1).approve(vote.getAddress(), 1);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+301 , block?.timestamp+331);

     await time.increase(316);
     await vote.voteAgainst(0, 1, rt.getAddress());

     const _proposal = await vote.getProposal(0);

     expect(_proposal.negativeVotes).to.eq(1);
     expect(await vote.hasVoted(0,user1)).to.eq(true);
    });

 it('should faild Voting has not started yet', async function() {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 1);
     await rt.connect(user1).approve(vote.getAddress(), 1);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await expect(vote.voteFor(0, 1, rt.getAddress())).to.revertedWith("Voting has not started yet");
    });

 it('should faild The voting has already ended', async function() {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 1);
     await rt.connect(user1).approve(vote.getAddress(), 1);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(500);
     await expect(vote.voteFor(0, 1, rt.getAddress())).to.revertedWith("The voting has already ended");
    });

 it('should faild hasVoted', async function() {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 1);
     await rt.connect(user1).approve(vote.getAddress(), 1);

     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);
     await vote.voteFor(0, 1, rt.getAddress());
     await expect(vote.voteFor(0, 1, rt.getAddress())).to.revertedWith("Already voted");
    });

 it('one user two proposal', async function() {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 2);
     await rt.connect(user1).approve(vote.getAddress(), 2);

     const proposal1 = "Test";
     const proposal2 = "proposla"
     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal(proposal1,  block?.timestamp+401 , block?.timestamp+431);
     await vote._createProposal(proposal2,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);

     await vote.voteAgainst(0, 1,rt.getAddress());
     await vote.voteFor(1, 1,rt.getAddress());

     const _proposal1 = await vote.getProposal(0);
     const _proposal2 = await vote.getProposal(1);

     expect(_proposal1.negativeVotes).to.eq(1);
     expect(await vote.hasVoted(0,user1)).to.eq(true);
     expect(_proposal2.positiveVotes).to.eq(1);
     expect(await vote.hasVoted(1,user1)).to.eq(true);
    });

 it('two user one proposal', async function() {
     const {vote, user1, user2, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 1);
     await rt.connect(user1).approve(vote.getAddress(), 1);
     await rt.mint(user2.address, 1);
     await rt.connect(user2).approve(vote.getAddress(), 1);

     const proposal = "Test";
     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);

     await vote.connect(user1).voteAgainst(0,1,rt.getAddress());
     await vote.connect(user2).voteFor(0,1,rt.getAddress());

     const _proposal = await vote.getProposal(0);

     expect(await vote.hasVoted(0,user1)).to.eq(true);
     expect(await vote.hasVoted(0,user2)).to.eq(true);
     expect(_proposal.positiveVotes).to.eq(1);
     expect(_proposal.negativeVotes).to.eq(1);
    });

 it('two user two proposal', async function() {
     const {vote, user1, user2, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 2);
     await rt.connect(user1).approve(vote.getAddress(), 2);
     await rt.mint(user2.address, 2);
     await rt.connect(user2).approve(vote.getAddress(), 2);

     const proposal1 = "Test";
     const proposal2 = "proposal";
     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal(proposal1,  block?.timestamp+401 , block?.timestamp+431);
     await vote._createProposal(proposal2,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);

     await vote.connect(user1).voteAgainst(0,1, rt.getAddress());
     await vote.connect(user1).voteAgainst(1,1, rt.getAddress());

     await vote.connect(user2).voteFor(0,1, rt.getAddress());
     await vote.connect(user2).voteAgainst(1, 1, rt.getAddress());

     const _proposal1 = await vote.getProposal(0);
     const _proposal2 = await vote.getProposal(1);

     expect(await vote.hasVoted(0,user1)).to.eq(true);
     expect(await vote.hasVoted(0,user2)).to.eq(true);
     expect(await vote.hasVoted(1,user1)).to.eq(true);
     expect(await vote.hasVoted(1,user2)).to.eq(true);

     expect(_proposal1.positiveVotes).to.eq(1);
     expect(_proposal1.negativeVotes).to.eq(1);
     expect(_proposal2.positiveVotes).to.eq(0);
     expect(_proposal2.negativeVotes).to.eq(2);
    });

 it("should be change balance after vote", async function() {
     const {vote, user1, rt} = await loadFixture(deploy);

     await rt.mint(user1.address, 2);
     await rt.connect(user1).approve(vote.getAddress(), 2);

     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal("proposal1",  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);

     const tx = await vote.connect(user1).voteFor(0,1, rt.getAddress());

     const _proposal = await vote.getProposal(0);
    // уточнить по проверки баланса токенов
     await expect(tx).to.changeTokenBalances(
         rt,
         [user1, vote],
         [-1, 1]);
     expect(await vote.hasVoted(0,user1)).to.eq(true);
     expect(_proposal.positiveVotes).to.eq(1);
 });

 it("should be faild if payment < 1", async function() {
     const {vote, user1, rt} = await loadFixture(deploy);

     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal("proposal1",  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);

     await expect(vote.connect(user1).voteFor(0,0, rt.getAddress())).to.be.revertedWith("Payment must be equal 1 or greater");
    });

 it("should be faild if non-ownwer tries ti withdraw", async function() {
     const {vote, user2} = await loadFixture(deploy);

     const block = await ethers.provider.getBlock("latest");

     await vote._createProposal("proposal1",  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);

     await expect(vote.connect(user2).withdraw()).to.be.revertedWithCustomError(vote, "OwnableUnauthorizedAccount");
    });
// уточнить как переводить токены
//  it("should be change balanc owner after withdraw function", async function() {
//      const {vote, user1, user2,rt} = await loadFixture(deploy);
//
//      await rt.mint(user2.address, 5);
//      await rt.connect(user2).approve(vote.getAddress(), 5);
//
//      const block = await ethers.provider.getBlock("latest");
//      await vote._createProposal("proposal1",  block?.timestamp+401 , block?.timestamp+431);
//      await time.increase(415);
//
//      expect(await vote.connect(user2).voteFor(0,5,rt.getAddress())).to.changeTokenBalances(
//          rt,
//          [user1, vote],
//          [-5, 5]);
//      await expect (vote.connect(user1).withdraw()).to.changeTokenBalances(
//          rt,
//          [vote, user1],
//          [-5, 5]);
//      expect( await ethers.provider.getBalance(vote.getAddress())).to.equal(0);
//  });

});