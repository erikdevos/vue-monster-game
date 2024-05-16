
function getrandomvalue(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const app = Vue.createApp({
	data() {

		const monstersList = window.monstersList;

		return {
			monstersList,
			currentEnemyMonster: null,
			currentPlayerMonster: null,
			enemyMonster: null,
			fightStarted: null,
			gameEnded: null,
			monsterHealth: 100,
			enemyMonsterHealth: 0,
			currentPlayerMonsterHealth: 0,
			monsterAttackValue: 0,
			currentRound: 0,
			winner: null,
			logMessages: [],
			playerName: 'Ash',
			playerAttacked: false,
			monsterAttacked: false,
			specialAttackAttacked: false,
			healAnimation: false,
			playerLoseAnimation: false,
			playerSelect: true,
			monsterSelect: null,
			searchTermPlayer: '',
			searchTermEnemy: '',
			imagePathThumb: 'resources/monster-images/',
			imagePathFull: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/',
			direction: 'right',
			playerMonsterImageRotate: '',
			stageSelect: false,
			stagesPath: 'resources/stages/',
			stages: [ 
				{
					name: 'Field',
					image: 'battle-background.webp',
					type: 'bug'
				},
				{
					name: 'Volcano',
					image: 'background-fire.webp',
					type: 'fire'
				},
				{
					name: 'Forest',
					image: 'background-grass.webp',
					type: 'fire'
				},
				{
					name: 'Ocean',
					image: 'background-water.webp',
					type: 'water'
				}
				
			]
		};
		
	},

	watch: {
		currentPlayerMonsterHealth(value) {
			// In case of a draw
			if (value <= 0 && this.enemyMonsterHealth <= 0) {
				this.winner = "draw";
			} else if (value <= 0) {
				// In case the enemy wins
				this.winner = "monster";
				this.playerLoseAnimation = true;
				this.gameEnded = true;
			}
		},

		enemyMonsterHealth(value) {
			// In case of a draw
			if (value <= 0 && this.currentplayerMonsterHealth <= 0) {
				this.winner = "draw";
			} else if (value <= 0) {
				// If the player wins
				this.winner = "player";
				this.monsterLoseAnimation = true;
				this.enemyMonsterHealth = 0;
				this.gameEnded = true;
			}
		}
	},

	methods: {
		startFight() {
			// Start battle and reset all other values
			this.fightStarted = true;
			this.clearLog();
			this.winner = null;
			this.currentRound = 0;
			this.playerLoseAnimation = false;
			this.monsterLoseAnimation = false;
			this.monsterSelect = false;
			this.stageSelect = false;
			this.enemyMonsterHealth = this.currentEnemyMonster.health;
		
			// Ensure that this.playerMonster is defined before accessing its properties
			if (this.currentPlayerMonster.number === '0132') {
				this.selectDittoMonster();
			}
		},

		selectDittoMonster() {
			console.log("Ditto selected");
		
			// Find the Ditto monster in monster list based on its name
			const dittoMonster = this.monstersList.find(monster => monster.name === "Ditto");
			
			// Set the current player monster to Ditto and update its health
			this.currentPlayerMonster = { ...dittoMonster, health: this.currentEnemyMonsterHealth };
			this.currentPlayerMonster.health = this.currentEnemyMonsterHealth;
			this.currentPlayerMonsterHealth = this.currentPlayerMonster.health;
		},

		selectStage(stage) {
			this.selectedStage = stage;
			this.startFight();
		},

		selectPlayerMonster(playerMonster) {
			if (playerMonster === "random") {
				// Select a random monster from the array
				const randomIndex = Math.floor(Math.random() * this.monstersList.length);
				this.currentPlayerMonster = this.monstersList[randomIndex];
				console.log("Random playermonster");
			} else if (playerMonster === "Ditto") {
				this.selectDittoMonster();
			} else {
				// Set the selected player monster
				this.currentPlayerMonster = playerMonster;
			}
		
			// store the original health value
			this.currentPlayerMonsterHealth = this.currentPlayerMonster.health;
			this.playerSelect = false;
			this.monsterSelect = true;
		},
		
		
		  selectEnemyMonster(enemyMonster) {
			if (enemyMonster === "random") {
				const randomIndex = Math.floor(Math.random() * this.monstersList.length);
				this.currentEnemyMonster = this.monstersList[randomIndex];
			} else {
				this.currentEnemyMonster = enemyMonster;
			}
		
			this.currentEnemyMonsterHealth = this.currentEnemyMonster.health;

			this.monsterSelect = false;
			this.stageSelect = true;
		},

		resetAttackedStatus() {
			setTimeout(() => {
				this.playerAttacked = false;
				this.monsterAttacked = false;
				this.specialAttackAttacked = false;
			}, 1000);
		},

		flipEnemyMonsterImage() {
			if (this.currentEnemyMonster.direction == 'left') {
				return "flipright";
			}
			// Do nothing, keep current rotation
			return "keepleft";
		},

		flipPlayerMonsterImage() {
			if (this.currentPlayerMonster.direction == 'right') {
				return "flipleft";
			}
			// Do nothing, keep current rotation
			return "keepright";
		},

		attackMonster() {
			const result = getMultiplier(this.currentPlayerMonster.type, this.currentEnemyMonster.type);
			const damageMultiplier = result.damageMultiplier;
			const effectivenessString = result.effectivenessString;
		
			this.currentRound++;

			const playerAttackValue = getrandomvalue(12, 20);
			this.monsterAttackValue = getrandomvalue(18, 25);
			const totalDamage = playerAttackValue * damageMultiplier;
			this.enemyMonsterHealth -= totalDamage;
			this.addLogMessage("player", "attack", totalDamage, effectivenessString);
			this.monsterAttacked = true;
		
			setTimeout(() => {
				this.playerAttacked = true;
			}, 1000);
		
			setTimeout(() => {
				if (this.enemyMonsterHealth > 0) {
					this.attackPlayer();
				}
		
				setTimeout(() => {
					this.resetAttackedStatus();
				}, 300);
		
			}, 1000);
			return;
		},

		attackPlayer() {
			const result = getMultiplier(this.currentEnemyMonster.type, this.currentPlayerMonster.type);
			const damageMultiplier = result.damageMultiplier;
			const effectivenessString = result.effectivenessString;

			// Generate a random monster attack value within the specified range
			this.monsterAttackValue = getrandomvalue(18, 25);
		
			// Calculate the total damage by multiplying the base damage with the multiplier
			const totalDamage = this.monsterAttackValue * damageMultiplier;
		
			// Update the player monster's health
			this.currentPlayerMonsterHealth = Math.max(this.currentPlayerMonsterHealth - totalDamage, 0);
		
			// Log the attack message
			this.addLogMessage("monster", "attack", totalDamage, effectivenessString);
		
			return;
		},			

		specialAttackMonster() {
			this.currentRound++;
			
			// Generate a random value for the special attack
			const playerSpecialAttackValue = getrandomvalue(15, 25);

			// Get the damage multiplier based on monster types (roles reversed)
			const result = getMultiplier(this.currentPlayerMonster.type, this.currentEnemyMonster.type);
			const damageMultiplier = result.damageMultiplier;
			const effectivenessString = result.effectivenessString;

			// Calculate the total damage by multiplying the special attack value with the multiplier
			const totalDamage = playerSpecialAttackValue * damageMultiplier;
		
			// Update the enemy monster's health
			this.enemyMonsterHealth = Math.max(this.enemyMonsterHealth - totalDamage, 0);
		
			// Log the special attack message
			this.addLogMessage("player", "specialattack", totalDamage, effectivenessString);
			this.specialAttackAttacked = true;
		
			setTimeout(() => {
				this.playerAttacked = true;
			}, 1000);
		
			if (this.enemyMonsterHealth > 0) {
				setTimeout(() => {
					this.attackPlayer();
		
					setTimeout(() => {
						this.resetAttackedStatus();
					}, 300);
				}, 1000);
			}
		},				

		healPlayer() {
			this.currentRound++;
			this.healAnimation = true;
			const healValue = getrandomvalue(25, 35);
		
			if (this.currentPlayerMonsterHealth + healValue > this.currentPlayerMonster.health) {
				this.currentPlayerMonsterHealth = this.currentPlayerMonster.health;
			} else {
				this.currentPlayerMonsterHealth += healValue;
			}
		
			this.addLogMessage("player", "heal", healValue);
		
			// Delay for the monster's counter-attack
			setTimeout(() => {
				this.attackPlayer();
		
				setTimeout(() => {
					this.resetAttackedStatus();
					this.healAnimation = false;
				}, 300);
		
			}, 1000);
		},

		surrender() {
			this.winner = "monster";
			this.playerLoseAnimation = true;
		},

		resetGame() {
			this.gameEnded = false;
			this.fightStarted = false;
			this.playerSelect = true;
			this.clearLog();
			this.searchTermPlayer = '';
			this.searchTermEnemy = '';
		},

		addLogMessage(who, what, value, effectivenessString) {
			const attackerName =
				who === "player"
					? this.playerName + "'s " + this.currentPlayerMonster.name
					: this.currentEnemyMonster.name;
			const actionType = what === "heal" ? "heals" : "attacks and deals";

			const logMessage = {
				actionBy: who,
				actionType: what,
				actionValue: value,
				attackerName: attackerName,
				effectiveness: effectivenessString, 
			};

			if (who === "player") {
				logMessage["log--player"] = true;
			} else {
				logMessage["log--monster"] = true;
			}

			if (what === "heal") {
				logMessage["log--heal"] = true;
			} else {
				logMessage["log--attack"] = true;
			}

			this.logMessages.unshift(logMessage);
		},

		isAttackInProgress() {
			return this.playerAttacked || this.monsterAttacked;
		},

		clearLog() {
			this.logMessages = [];
		},

	},

	computed: {
		filteredPlayerMonsters() {
			const regex = new RegExp(this.searchTermPlayer, 'i');
			return this.sortedEnemyMonsters.filter(playerMonster => {
				return (
				regex.test(playerMonster.name) ||
				regex.test(playerMonster.type) ||
				regex.test(playerMonster.number.toString())
				);
			});
		},
			
		filteredEnemyMonsters() {
		const regex = new RegExp(this.searchTermEnemy, 'i');
		return this.sortedEnemyMonsters.filter(enemyMonster => {
			return (
			regex.test(enemyMonster.name) ||
			regex.test(enemyMonster.type) ||
			regex.test(enemyMonster.number.toString())
			);
		});
		},

		getBarStyles() {
			return (value, maxHealth) => {
			const percentage = (value / maxHealth) * 100;
			const scaledPercentage = Math.min(100, percentage);

			if (scaledPercentage <= 0) {
				return { width: "0%" };
			} else if (scaledPercentage <= 30) {
				return { "background-color": "red", width: scaledPercentage + "%" };
			} else if (scaledPercentage <= 50) {
				return { "background-color": "orange", width: scaledPercentage + "%" };
			} else {
				return { width: scaledPercentage + "%" };
			}
			};

		},

		playerBarStyles() {
			return this.getBarStyles(
				this.currentPlayerMonsterHealth, 
				this.currentPlayerMonster.health
			);
		},

		monsterBarStyles() {
			return this.getBarStyles(
				this.enemyMonsterHealth,
				this.currentEnemyMonster.health
			);
		},

		mayUseAttack() {
			return this.isAttackInProgress() || this.playerAttacked || this.monsterAttacked;
		},
		
		mayUseSpecialAttack() {
			return this.isAttackInProgress() || this.currentRound % 3 !== 0;
		},
		
		mayUseHeal() {
			return this.isAttackInProgress() || this.currentRound % 2 !== 0;
		},

		isLogEmpty() {
			return this.logMessages.length === 0;
		},
		
		sortedEnemyMonsters() {
			return this.monstersList.slice().sort((a, b) => a.number - b.number);
		},
	}
});

window.monstersList = monstersList;
const vm = app.mount('#game');
