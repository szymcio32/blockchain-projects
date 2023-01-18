// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract Contract {
	enum Choices { Yes, No }

	struct Vote {
		Choices choice;
		address voter;
	}

	// TODO: create a public state variable: an array of votes
	Vote[] public votes;

	function createVote(Choices choice) external {
		// TODO: add a new vote to the array of votes state variable
		Vote memory vote = _findAddress(msg.sender);
		require(vote.voter != msg.sender, "Address already voted");
		votes.push(Vote(choice, msg.sender));
	}

	function _findAddress(address _address) private view returns (Vote memory){
		Vote memory vote = Vote(Choices.Yes, address(0));
		for(uint i; i < votes.length; i++){
			if (votes[i].voter == _address){
				vote = votes[i];
				break;
			}
		}
		return vote;
	}

	function hasVoted(address voter) external view returns (bool){
		Vote memory vote = _findAddress(voter);
		if(vote.voter != voter){
			return false;
		}
		return true;
	}

	function findChoice(address voter) external view returns (Choices){
		Vote memory vote = _findAddress(voter);
		return vote.choice;
	}

	function changeVote(Choices choice) external {
		bool voted = false;
		for(uint i; i < votes.length; i++){
			if (votes[i].voter == msg.sender){
				Vote storage vote = votes[i];
				vote.choice = choice;
				voted = true;
				break;
			}
		}
		require(voted, "Address not voted");
	}

}