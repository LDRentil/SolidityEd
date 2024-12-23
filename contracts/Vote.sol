// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
contract Vote {

    struct itsVote {
        string proposal;
        uint256 negativeVoice;
        uint256 positiveVoice ;
        uint32 startVoteTime;
        uint32 endVoteTime;
        bool executed;
    }

    itsVote[] public votes;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event newProposal(uint256 indexed id, string proposal, uint32 startVoteTime,uint32 endVoteTime);

    function _createProposal(string _proposal) public {
        uint256 id = uint256(keccak256(_proposal), block.timestamp);
        require(votes[id].startVoteTime == 0,"");
        votes.push(Vote (id, _proposal, false,0,0,block.timestamp,block.timestamp+30));
        newProposal(id,_proposal, false,0,0,block.timestamp,block.timestamp+30);
    }

    function voteFor(uint256 _proposalId) public {
        itsVote _vote = votes[_proposalId];
        require(block.timestamp <= itsVote.startVoteTime,"Voting has not started yet.");
        require(block.timestamp >= itsVote.endVoteTime,"The voting has already ended.");
        require(!hasVoted[msg.sender],"Already voted");
        hasVoted[msg.sender];
        itsVote.positiveVoice++;
        hasVoted = true;
    }

    function voteAgainst(uint256 _proposalId) public {
        itsVote _vote = votes[_proposalId];
        require(block.timestamp <= itsVote.startVoteTime,"Voting has not started yet.");
        require(block.timestamp >= itsVote.endVoteTime,"The voting has already ended.");
        require(!hasVoted[msg.sender],"Already voted");
        hasVoted[msg.sender];
        itsVote.negativeVoice++;
        hasVoted = true;
    }

    function getProposal(uint256 _proposalId) public view returns (
        string memory proposal,
        uint256 positiveVotes,
        uint256 negativeVotes,
        uint32 startVoteTime,
        uint32 endVoteTime,
        bool executed
    )
    {
        require(_proposalId < votes.length, "Invalid proposal ID");
        itsVote storage vote = votes[_proposalId];
        return (
            vote.proposal,
            vote.positiveVoice,
            vote.negativeVoice,
            vote.startVoteTime,
            vote.endVoteTime,
            vote.executed
        );
    }

}