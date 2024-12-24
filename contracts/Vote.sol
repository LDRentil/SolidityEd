// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
contract Vote {
// повторить мемори
    struct itsVote {
        string proposal;
        uint256 negativeVoice;
        uint256 positiveVoice ;
        uint32 startVoteTime;
        uint32 endVoteTime;
        bool executed;
    }

    itsVote[] public votes;

    mapping(address => bool) public hasVoted;

    event newProposal(uint256 indexed id, string proposal, uint32 startVoteTime,uint32 endVoteTime);

    function _createProposal(string memory _proposal) public {
        uint256 id = uint256(keccak256(abi.encodePacked(_proposal, block.timestamp)));
        require(votes[id].startVoteTime == 0,"");
        votes.push(itsVote (_proposal,0,0,uint32(block.timestamp),uint32(block.timestamp+30),false));
        emit newProposal(id,_proposal,uint32(block.timestamp),uint32(block.timestamp+30));
    }

    function voteFor(uint256 _proposalId) public {
        itsVote memory _vote = votes[_proposalId];
        require(block.timestamp <= votes[_proposalId].startVoteTime,"Voting has not started yet.");
        require(block.timestamp >= votes[_proposalId].endVoteTime,"The voting has already ended.");
        require(!hasVoted[msg.sender],"Already voted");
        hasVoted[msg.sender];
        votes[_proposalId].positiveVoice++;
        hasVoted[msg.sender] = true;
    }

    function voteAgainst(uint256 _proposalId) public {
        itsVote memory _vote = votes[_proposalId];
        require(block.timestamp <= votes[_proposalId].startVoteTime,"Voting has not started yet.");
        require(block.timestamp >= votes[_proposalId].endVoteTime,"The voting has already ended.");
        require(!hasVoted[msg.sender],"Already voted");
        hasVoted[msg.sender];
        votes[_proposalId].negativeVoice++;
        hasVoted[msg.sender] = true;
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