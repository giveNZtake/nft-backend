// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";

contract USDC is ERC20Base {
    constructor(
        address _defaultAdmin, string memory _name, string memory _symbol
    ) ERC20Base(_defaultAdmin, _name, _symbol) {
    }
}
