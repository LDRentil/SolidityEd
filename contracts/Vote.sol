// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/access/Ownable.sol";
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

    function voteFor(uint256 _proposalId) public payable{
        _votes(_proposalId, true);
    }

    function voteAgainst(uint256 _proposalId) public payable{
        _votes(_proposalId, false);
    }
    function _votes(uint256 _proposalId, bool _type) private {
        itsVote memory _vote = votes[_proposalId];
        require(block.timestamp >= _vote.startVoteTime,"Voting has not started yet");
        require(block.timestamp < _vote.endVoteTime,"The voting has already ended");
        require(!hasVoted[_proposalId][msg.sender],"Already voted");
        require(msg.value > 0, "Payment must be greater than 0");
        if(!_type){
            votes[_proposalId].negativeVoice=_vote.negativeVoice+msg.value;
        } else{
            votes[_proposalId].positiveVoice=_vote.positiveVoice+msg.value;
        }
        hasVoted[_proposalId][msg.sender] = true;
    }

    function withdraw() external onlyOwner {
        (bool sent, ) = owner().call{value: address (this).balance}("");
        require(sent, "Failed to send Ether");
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