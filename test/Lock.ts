import {loadFixture, ethers, expect, HardhatEthersSigner} from "./setup";
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

 it('should create a new proposal', async function() {
     const {vote} = await loadFixture(deploy);
     const proposal = "Test proposla";
     const block = await ethers.provider.getBlock("latest");
     const tx = vote._createProposal("Test proposla");
     await expect(tx).to.emit(vote, "newProposal").withArgs(0, proposal, block?.timestamp+1, block?.timestamp+31);
    });
//зайфелить рекваеры
 it('shold vote For'),async function(){
     const {vote} = await loadFixture(deploy);
     const proposalId = 0;
     const block = await ethers.provider.getBlock("latest");
     const start = ;
     await expect(block?.timestamp).to.eq(start);
     // await expect(tx).to.revertedWith("рекваер");
 }
});
