// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./Hero.sol";

// TODO: create Mage/Warrior Heroes
contract Mage is Hero(50) {
    function attack(address enemyContract) public override {
        Enemy enemy = Enemy(enemyContract);
        enemy.takeAttack(AttackTypes.Spell);
        super.attack(enemyContract);
    }
}
contract Warrior is Hero(200) {
    function attack(address enemyContract) public override {
        Enemy enemy = Enemy(enemyContract);
        enemy.takeAttack(AttackTypes.Brawl);
        super.attack(enemyContract);
    }
}