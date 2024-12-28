import {loadFixture, ethers, expect, HardhatEthersSigner, time} from "./setup";
import {artifacts} from "hardhat";
import {Vote} from "../typechain-types";


describe("Vote", function () {
 async function deploy(): Promise<{
     user1:HardhatEthersSigner;
     user2:HardhatEthersSigner;
     user3:HardhatEthersSigner;
     user4:HardhatEthersSigner;
     vote:Vote;
 }>{
     const Factory = await  ethers.getContractFactory("Vote");
     const  vote = await Factory.deploy();
     await vote.waitForDeployment();
     const  [user1, user2, user3, user4] = await ethers.getSigners();

     return { user1, user2, user3, user4, vote }
 }
 it("should be deployed", async function() {
     const {vote} = await loadFixture(deploy);
     expect(vote.target).to.be.properAddress;
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
     const {vote, user1} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+301 , block?.timestamp+331);
     await time.increase(316);
     await vote.voteFor(proposalId);
     const _proposal = await vote.getProposal(0);
     expect(_proposal.positiveVotes).to.eq(1);
     expect(await vote.hasVoted(user1)).to.eq(true);
 });

 it('should faild Voting has not started yet', async function() {
     const {vote} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await expect(vote.voteFor(proposalId)).to.revertedWith("Voting has not started yet");
    });

 it('should faild The voting has already ended', async function() {
     const {vote} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(500);
     await expect(vote.voteFor(proposalId)).to.revertedWith("The voting has already ended");
    });

 it('should faild hasVoted', async function() {
     const {vote, user1} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);
     await vote.voteFor(proposalId);
     await expect(vote.voteFor(proposalId)).to.revertedWith("Already voted");
    });

 it('shold vote Against', async function () {
     const {vote, user1} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+301 , block?.timestamp+331);
     await time.increase(316);
     await vote.voteAgainst(proposalId);
     const _proposal = await vote.getProposal(0);
     expect(_proposal.negativeVotes).to.eq(1);
     expect(await vote.hasVoted(user1)).to.eq(true);
    });

 it('should faild Voting has not started yet', async function() {
     const {vote} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await expect(vote.voteAgainst(proposalId)).to.revertedWith("Voting has not started yet");
    });

 it('should faild The voting has already ended', async function() {
     const {vote} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(500);
     await expect(vote.voteAgainst(proposalId)).to.revertedWith("The voting has already ended");
    });

 it('should faild hasVoted', async function() {
     const {vote, user1} = await loadFixture(deploy);
     const proposalId = 0;
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     await vote._createProposal(proposal,  block?.timestamp+401 , block?.timestamp+431);
     await time.increase(415);
     await vote.voteAgainst(proposalId);
     await expect(vote.voteAgainst(proposalId)).to.revertedWith("Already voted");
    });
});
