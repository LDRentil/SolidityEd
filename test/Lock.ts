import {loadFixture, ethers, expect} from "./setup";
import {artifacts} from "hardhat";


describe("Vote", function () {
 async function deploy(){
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

 it('should ', () => {
     const {vote} = await loadFixture(deploy);
     expect(vote.voteAgainst);
    });
});
