// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/Staking1155Base.sol";

contract RealEstateStaking is Staking1155Base {
    constructor(
        uint80 _defaultTimeUnit,
        address _defaultAdmin,
        uint256 _defaultRewardsPerUnitTime,
        address _stakingToken,
        address _rewardToken,
        address _nativeTokenWrapper
    )
        Staking1155Base(
            _defaultTimeUnit,
            _defaultAdmin,
            _defaultRewardsPerUnitTime,
            _stakingToken,
            _rewardToken,
            _nativeTokenWrapper
        )
    {
    }

    function batchClaimRewards(uint256[] memory _tokenIds) external nonReentrant {
        for (uint256 i = 0; i < _tokenIds.length; i += 1) {
            if (_calculateRewards(_tokenIds[i], _stakeMsgSender()) > 0) {
                _claimRewards(_tokenIds[i]);
            }
        }
    }
}