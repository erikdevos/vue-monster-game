
function getrandomvalue(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateDamage(attackerType, moveType, opponentType) {
    const typeChart = {
        Normal: { Normal: 1, Fighting: 2, Flying: 1, Poison: 1, Ground: 1, Rock: 0.5, Bug: 1, Ghost: 0, Steel: 0.5, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 1, Ice: 1, Dragon: 1, Dark: 1, Fairy: 1 },
        Fighting: { Normal: 0.5, Fighting: 1, Flying: 0.5, Poison: 0.5, Ground: 1, Rock: 2, Bug: 0.5, Ghost: 0, Steel: 2, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 0.5, Ice: 2, Dragon: 1, Dark: 2, Fairy: 0.5 },
        Flying: { Normal: 1, Fighting: 2, Flying: 1, Poison: 1, Ground: 1, Rock: 0.5, Bug: 2, Ghost: 1, Steel: 0.5, Fire: 1, Water: 1, Grass: 0.5, Electric: 2, Psychic: 1, Ice: 2, Dragon: 1, Dark: 1, Fairy: 1 },
        Poison: { Normal: 1, Fighting: 1, Flying: 1, Poison: 0.5, Ground: 2, Rock: 1, Bug: 1, Ghost: 1, Steel: 0, Fire: 1, Water: 1, Grass: 0.5, Electric: 1, Psychic: 1, Ice: 1, Dragon: 1, Dark: 1, Fairy: 2 },
        Ground: { Normal: 1, Fighting: 1, Flying: 0, Poison: 2, Ground: 1, Rock: 2, Bug: 0.5, Ghost: 1, Steel: 2, Fire: 2, Water: 1, Grass: 0.5, Electric: 2, Psychic: 1, Ice: 1, Dragon: 1, Dark: 1, Fairy: 1 },
        Rock: { Normal: 1, Fighting: 0.5, Flying: 2, Poison: 1, Ground: 0.5, Rock: 1, Bug: 2, Ghost: 1, Steel: 0.5, Fire: 2, Water: 1, Grass: 1, Electric: 1, Psychic: 1, Ice: 2, Dragon: 1, Dark: 1, Fairy: 1 },
        Bug: { Normal: 1, Fighting: 0.5, Flying: 0.5, Poison: 1, Ground: 1, Rock: 1, Bug: 1, Ghost: 0.5, Steel: 0.5, Fire: 0.5, Water: 1, Grass: 2, Electric: 1, Psychic: 2, Ice: 1, Dragon: 1, Dark: 2, Fairy: 0.5 },
        Ghost: { Normal: 0, Fighting: 0, Flying: 1, Poison: 1, Ground: 1, Rock: 1, Bug: 1, Ghost: 2, Steel: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 1, Ice: 1, Dragon: 1, Dark: 0.5, Fairy: 1 },
        Steel: { Normal: 0.5, Fighting: 2, Flying: 0.5, Poison: 0, Ground: 2, Rock: 0.5, Bug: 0.5, Ghost: 1, Steel: 0.5, Fire: 2, Water: 1, Grass: 0.5, Electric: 1, Psychic: 0.5, Ice: 0.5, Dragon: 0.5, Dark: 0.5, Fairy: 0.5 },
        Fire: { Normal: 1, Fighting: 1, Flying: 1, Poison: 1, Ground: 1, Rock: 0.5, Bug: 2, Ghost: 1, Steel: 0.5, Fire: 0.5, Water: 2, Grass: 0.5, Electric: 1, Psychic: 1, Ice: 2, Dragon: 1, Dark: 1, Fairy: 0.5 },
        Water: { Normal: 1, Fighting: 1, Flying: 1, Poison: 1, Ground: 1, Rock: 2, Bug: 1, Ghost: 1, Steel: 0.5, Fire: 0.5, Water: 0.5, Grass: 2, Electric: 1, Psychic: 1, Ice: 1, Dragon: 1, Dark: 1, Fairy: 1 },
        Grass: { Normal: 1, Fighting: 1, Flying: 2, Poison: 2, Ground: 0.5, Rock: 0.5, Bug: 0.5, Ghost: 1, Steel: 2, Fire: 2, Water: 0.5, Grass: 0.5, Electric: 1, Psychic: 1, Ice: 2, Dragon: 1, Dark: 1, Fairy: 1 },
        Electric: { Normal: 1, Fighting: 1, Flying: 0.5, Poison: 1, Ground: 2, Rock: 1, Bug: 1, Ghost: 1, Steel: 0.5, Fire: 1, Water: 1, Grass: 1, Electric: 0.5, Psychic: 1, Ice: 1, Dragon: 1, Dark: 1, Fairy: 1 },
        Psychic: { Normal: 1, Fighting: 2, Flying: 1, Poison: 2, Ground: 1, Rock: 1, Bug: 1, Ghost: 1, Steel: 0.5, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 0.5, Ice: 1, Dragon: 1, Dark: 0, Fairy: 1 },
        Ice: { Normal: 1, Fighting: 1, Flying: 2, Poison: 1, Ground: 2, Rock: 1, Bug: 1, Ghost: 1, Steel: 0.5, Fire: 0.5, Water: 0.5, Grass: 2, Electric: 1, Psychic: 1, Ice: 0.5, Dragon: 2, Dark: 1, Fairy: 1 },
        Dragon: { Normal: 1, Fighting: 1, Flying: 1, Poison: 1, Ground: 1, Rock: 1, Bug: 1, Ghost: 1, Steel: 0.5, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 1, Ice: 2, Dragon: 2, Dark: 1, Fairy: 0 },
        Dark: { Normal: 1, Fighting: 0.5, Flying: 1, Poison: 1, Ground: 1, Rock: 1, Bug: 1, Ghost: 2, Steel: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 2, Ice: 1, Dragon: 1, Dark: 0.5, Fairy: 2 },
        Fairy: { Normal: 1, Fighting: 2, Flying: 1, Poison: 0.5, Ground: 1, Rock: 1, Bug: 1, Ghost: 1, Steel: 2, Fire: 1, Water: 1, Grass: 1, Electric: 1, Psychic: 1, Ice: 1, Dragon: 0, Dark: 0.5, Fairy: 1 },
    };

    const effectiveness = typeChart[moveType][opponentType];
    const damageMultiplier = effectiveness === undefined ? 1 : effectiveness;

    // Assuming base damage and other factors, you can adjust this based on your game's mechanics.
    const baseDamage = 50;
    const totalDamage = baseDamage * damageMultiplier;

    return totalDamage;
}

const app = Vue.createApp({
	data() {

		const monstersList = window.monstersList;

		return {
			monstersList,
			currentEnemyMonster: null,
			currentPlayerMonster: null,
			enemyMonster: null,
			gameStarted: null,
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
			imagePathThumb: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/',
			imagePathFull: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/'
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
		startGame() {
			this.gameStarted = true;
			this.clearLog();
			this.winner = null;
			this.currentRound = 0;
			this.playerLoseAnimation = false;
			this.monsterLoseAnimation = false;
			this.monsterSelect = false;
			this.enemyMonsterHealth = this.currentEnemyMonster.health;
		},

		selectPlayerMonster(playerMonster) {
			if (playerMonster === "random") {
			  // Select a random monster from the array
			  const randomIndex = Math.floor(Math.random() * this.monstersList.length);
			  this.currentPlayerMonster = this.monstersList[randomIndex];
			} else {
			  // Set the selected player monster
			  this.currentPlayerMonster = playerMonster;
			}
		  
			// store the original health value
			this.currentPlayerMonsterHealth = this.currentPlayerMonster.health; 
		  
			this.playerSelect = false;
			this.monsterSelect = true;
		  
			console.log(this.currentPlayerMonsterHealth);
		  },
		
		
		selectEnemyMonster(enemyMonster) {
			if (enemyMonster === "random") {
				// Select a random monster from the array
				const randomIndex = Math.floor(Math.random() * this.monstersList.length);
				this.currentEnemyMonster = this.monstersList[randomIndex];
			} else {
				// Set the selected enemy monster
				this.currentEnemyMonster = enemyMonster;
			}

			this.currentEnemyMonsterHealth = this.currentEnemyMonster.health;
			this.monsterSelect = false;
			console.log(this.currentEnemyMonsterHealth);
			this.startGame();
		},	

		resetAttackedStatus() {
			setTimeout(() => {
				this.playerAttacked = false;
				this.monsterAttacked = false;
				this.specialAttackAttacked = false;
			}, 1000);
		},

		attackMonster() {
			console.log("Before attack: playerHealth", this.currentPlayerMonsterHealth, "enemyMonsterHealth", this.enemyMonsterHealth);
				
			this.currentRound++;
			const playerAttackValue = getrandomvalue(12, 20);
			this.monsterAttackValue = getrandomvalue(18, 25);
			this.enemyMonsterHealth -= playerAttackValue;
			this.addLogMessage("player", "attack", playerAttackValue);
			this.monsterAttacked = true;
		
			setTimeout(() => {
				this.playerAttacked = true;
			}, 1000);
		
			setTimeout(() => {
				if (this.enemyMonsterHealth > 0) {
					this.attackPlayer();
					console.log("monster attacks back");
				}
		
				setTimeout(() => {
					this.resetAttackedStatus();
				}, 300);
		
				console.log("After attack: playerHealth", this.currentPlayerMonsterHealth, "enemyMonsterHealth", this.enemyMonsterHealth);
				console.log("currentPlayerMonsterHealth", this.currentPlayerMonsterHealth); // Add this line
				console.log("original health", this.currentPlayerMonster.health); // Add this line
				console.log("Live health", this.currentPlayerMonsterHealth); // Add this line
			}, 1000);
		},

		attackPlayer() {
			this.currentPlayerMonsterHealth = Math.max(this.currentPlayerMonsterHealth - this.monsterAttackValue, 0);
			this.addLogMessage("monster", "attack", this.monsterAttackValue);
			return;
		},

		specialAttackMonster() {
			this.currentRound++;
			const attackValue = getrandomvalue(15, 25);
			this.enemyMonsterHealth -= attackValue;
			this.addLogMessage("player", "specialattack", attackValue);
			this.specialAttackAttacked = true;
			setTimeout(() => {
				this.playerAttacked = true;
			}, 1000);

			if (this.enemyMonsterHealth > 0) {		
				setTimeout(() => {

					this.attackPlayer();
					console.log("monster attacks back after special attack");

					setTimeout(() => {
						this.resetAttackedStatus();
					}, 300);
				}, 1000);
			};

		},

		healPlayer() {
			this.currentRound++;
			this.healAnimation = true;
			const healValue = getrandomvalue(25, 35);
			console.log("healing");
			console.log(healValue);
		
			if (this.currentPlayerMonsterHealth + healValue > this.currentPlayerMonster.health) {
				this.currentPlayerMonsterHealth = this.currentPlayerMonster.health;
				console.log("health after healing (if)");
				console.log(this.currentPlayerMonsterHealth);
				console.log("healvalue:");
				console.log(healValue);
			} else {
				this.currentPlayerMonsterHealth += healValue;
				console.log("health after healing (else)")
				console.log(this.currentPlayerMonsterHealth);
				console.log("healvalue:");
				console.log(healValue);
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
			this.gameStarted = false;
			this.playerSelect = true;
			this.clearLog();
		},

		addLogMessage(who, what, value) {
			const attackerName =
				who === "player"
					? this.playerName + "'s " + this.currentPlayerMonster.name
					: this.currentEnemyMonster.name;
			const actionType = what === "heal" ? "heals" : "attacks and deals";

			const logMessage = {
				actionBy: who,
				actionType: what,
				actionValue: value,
				attackerName: attackerName
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

		clearLog() {
			this.logMessages = [];
		},

	},

	computed: {
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
			console.log("original health:");
			console.log(this.currentPlayerMonster.health);
			console.log("Live health:");
			console.log(this.currentPlayerMonsterHealth);

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

		mayUseSpecialAttack() {
			return this.currentRound % 3 !== 0;
		},

		mayUseHeal() {
			return this.currentRound % 2 !== 0;
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
