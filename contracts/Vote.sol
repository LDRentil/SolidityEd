// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
contract Vote {
    struct itsVote {
        string proposal;
        uint256 negativeVoice;
        uint256 positiveVoice ;
        uint32 startVoteTime;
        uint32 endVoteTime;
    }

    itsVote[] public votes;
    uint256 public counter;
    mapping(address => bool) public hasVoted;

    event newProposal(uint256 indexed id, string proposal, uint32 startVoteTime,uint32 endVoteTime);

     function _createProposal(string memory _proposal, uint32 _startVoteTime,uint32 _endVoteTime) public {
        require(_startVoteTime > block.timestamp,"Start timestamp invalid");
        require(_endVoteTime > _startVoteTime, "End timestamp invalid");
        uint256 id = counter;
        counter++;
        votes.push(itsVote (_proposal,0,0,_startVoteTime,_endVoteTime));
        emit newProposal(id,_proposal,_startVoteTime,_endVoteTime);
    }

    function voteFor(uint256 _proposalId) public {
        itsVote memory _vote = votes[_proposalId];
        require(block.timestamp >= _vote.startVoteTime,"Voting has not started yet");
        require(block.timestamp < _vote.endVoteTime,"The voting has already ended");
        require(!hasVoted[msg.sender],"Already voted");
        votes[_proposalId].positiveVoice=_vote.positiveVoice+1;
        hasVoted[msg.sender] = true;
    }

    function voteAgainst(uint256 _proposalId) public {
        itsVote memory _vote = votes[_proposalId];
        require(block.timestamp >= _vote.startVoteTime,"Voting has not started yet");
        require(block.timestamp < _vote.endVoteTime,"The voting has already ended");
        require(!hasVoted[msg.sender],"Already voted");
        votes[_proposalId].negativeVoice=_vote.negativeVoice+1;
        hasVoted[msg.sender] = true;
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