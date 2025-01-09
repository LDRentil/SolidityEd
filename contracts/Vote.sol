// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract Vote is Ownable(msg.sender){


    struct itsVote {
        string proposal;
        uint256 negativeVoice;
        uint256 positiveVoice ;
        uint32 startVoteTime;
        uint32 endVoteTime;
    }

    itsVote[] public votes;
    uint256 public counter;
    mapping(uint256 => mapping(address => bool)) public hasVoted;


    event newProposal(uint256 indexed id, string proposal, uint32 startVoteTime,uint32 endVoteTime);

    function _createProposal(string memory _proposal, uint32 _startVoteTime,uint32 _endVoteTime) public {
        require(_startVoteTime > block.timestamp,"Start timestamp invalid");
        require(_endVoteTime > _startVoteTime, "End timestamp invalid");
        uint256 id = counter;
        counter++;
        votes.push(itsVote (_proposal,0,0,_startVoteTime,_endVoteTime));
        emit newProposal(id,_proposal,_startVoteTime,_endVoteTime);
    }

    function voteFor(uint256 _proposalId,uint256 amount, address token) public payable{
        _votes(_proposalId, true, amount, token);
    }

    function voteAgainst(uint256 _proposalId, uint256 amount, address token) public payable{
        _votes(_proposalId, false,amount, token);
    }

    function _votes(uint256 _proposalId, bool _type, uint256 amount, address token) private {
        itsVote memory _vote = votes[_proposalId];
        require(block.timestamp >= _vote.startVoteTime,"Voting has not started yet");
        require(block.timestamp < _vote.endVoteTime,"The voting has already ended");
        require(!hasVoted[_proposalId][msg.sender],"Already voted");
        require(amount > 0, "Payment must be equal 1 or greater");
        require(token != address(0), "Token address cannot be zero");
        require(amount % (10**ERC20(token).decimals()) == 0, "Only whole tokens are allowed");
        ERC20(token).transferFrom( msg.sender, address(this), amount);
        if(!_type){
            votes[_proposalId].negativeVoice=_vote.negativeVoice+amount/10**ERC20(token).decimals();
        } else{
            votes[_proposalId].positiveVoice=_vote.positiveVoice+amount/10**ERC20(token).decimals();
        }
        hasVoted[_proposalId][msg.sender] = true;
    }

    function withdraw(address token) external onlyOwner {
        require(token != address(0), "Token address cannot be zero");

        uint256 balance = ERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        bool success = ERC20(token).transfer(msg.sender, balance);
        require(success, "Failed to send tokens");
    }


    function getProposal(uint256 _proposalId) public view returns (
        string memory proposal,
        uint256 positiveVotes,
        uint256 negativeVotes,
        uint32 startVoteTime,
        uint32 endVoteTime
    )
    {
        itsVote storage vote = votes[_proposalId];
        return (
            vote.proposal,
            vote.positiveVoice,
            vote.negativeVoice,
            vote.startVoteTime,
            vote.endVoteTime
        );
    }

}