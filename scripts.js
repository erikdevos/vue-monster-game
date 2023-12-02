
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
		const enemyMonsters = [
			{
				name: "MewTwo",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/150.png",
				health: 120,
				number: '0151',
				size: 'm',
                type: 'psychic'
			},
			{
				name: "Mew",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/151.png",
				health: 120,
				number: '0150',
				size: 's',
                type: 'psychic'
			},
			{
				name: "Bulbasaur",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png",
				health: 80,
				number: '0001',
				size: 's',
                type: 'grass'
			},
			{
				name: "Charmander",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png",
				health: 80,
				number: '0004',
				size: 's',
                type: 'fire'
			},
			{
				name: "Charizard",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png",
				health: 180,
				number: '0006',
				size: 'l',
                type: 'fire'
			},
			{
				name: "Squirtle",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png",
				health: 80,
				number: '0007',
				size: 's',
                type: 'water'
			},
			{
				name: "Blastoise",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/009.png",
				health: 180,
				number: '0009',
				size: 'l',
                type: 'water'
			},
			{
				name: "Venusaur",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/003.png",
				health: 180,
				number: '0003',
				size: 'l',
                type: 'grass'
			},
			{
				name: "Magikarp",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/129.png",
				health: 30,
				number: '0129',
				size: 's',
                type: 'water'
			},
			{
				name: "Dragonite",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/149.png",
				health: 180,
				number: '0149',
				size: 'l',
                type: 'dragon'
			},
			{
				name: "Moltres",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/146.png",
				health: 220,
				number: '0146',
				size: 'l',
                type: 'fire'
			},
			{
				name: "Eternatus",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/890.png",
				health: 320,
				number: '0890',
				size: 'xl',
                type: 'dragon'
			},
			{
				name: "Alakazam",
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/065.png",
				health: 180,
				number: '0065',
				size: 'm',
                type: 'psychic'
			}
		];

		const randomIndex = Math.floor(Math.random() * enemyMonsters.length);
		const initialMonsterHealth = enemyMonsters[randomIndex].health;
		return {
			enemyMonsters,
			currentEnemyMonster: null,
			gameStarted: null,
			playerHealth: 100,
			monsterHealth: 100,
			enemyMonsterHealth: 0,
			currentRound: 0,
			winner: null,
			logMessages: [],
			playerMonsterName: "Pikachu",
			playerName: 'Ash',
			playerAttacked: false,
			monsterAttacked: false,
			specialAttackAttacked: false,
			healAnimation: false,
			surrenderAnimation: false,
			playerSelect: true,
			monsterSelect: null
		};
	},

	watch: {
		playerHealth(value) {
			if (value <= 0 && this.enemyMonsterHealth <= 0) {
				this.winner = "draw";
			} else if (value <= 0) {
				this.winner = "monster";
			}
		},
		enemyMonsterHealth(value) {
			if (value <= 0 && this.playerHealth <= 0) {
				this.winner = "draw";
			} else if (value <= 0) {
				this.winner = "player";
				this.loseAnimation = true;
				this.enemyMonsterHealth = 0;
			}
		}
	},

	methods: {
		startGame() {
			this.gameStarted = true;
			this.clearLog();
			this.playerHealth = 100;
			this.monsterHealth = 100;
			this.enemyMonsterHealth = 0;
			this.winner = null;
			this.currentRound = 0;
			this.surrenderAnimation = false;
			this.monsterSelect = false;	

        if (this.selectedMonster) {
        this.currentEnemyMonster = this.selectedMonster;
        } else {
        // Handle the case where no monster is selected (you can add custom logic here)
        // For now, let's set it to use the first monster in the list
        this.currentEnemyMonster = this.enemyMonsters[0];
        }

        this.enemyMonsterHealth = this.currentEnemyMonster.health;
        },
		
        selectMonster(monster) {
            this.selectedMonster = monster;
			this.monsterSelect = false;
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
			console.log(
				"Before attack: playerHealth",
				this.playerHealth,
				"enemyMonsterHealth",
				this.enemyMonsterHealth
			);

			if (this.playerHealth <= 0) {
				// Player's health is already 0 or below, no further attacks allowed
				return;
			}

			this.currentRound++;
			const playerAttackValue = getrandomvalue(5, 12);
			const monsterAttackValue = getrandomvalue(8, 15);

			this.enemyMonsterHealth -= playerAttackValue;
			this.addLogMessage("player", "attack", playerAttackValue);

			this.playerAttacked = true;
			this.attackPlayer();

			if (this.enemyMonsterHealth > 0) {
				this.playerHealth = Math.max(this.playerHealth - monsterAttackValue, 0);
				this.addLogMessage("monster", "attack", monsterAttackValue);
				this.monsterAttacked = true;
			}

			setTimeout(() => {
				this.resetAttackedStatus();
			}, 300);
			console.log(
				"After attack: playerHealth",
				this.playerHealth,
				"enemyMonsterHealth",
				this.enemyMonsterHealth
			);
		},

		attackPlayer() {
			const attackValue = getrandomvalue(8, 15);
			this.playerHealth = Math.max(this.playerHealth - attackValue, 0);
		},

		specialAttackMonster() {
			this.currentRound++;
			const attackValue = getrandomvalue(12, 20);
			this.enemyMonsterHealth -= attackValue;
			this.addLogMessage("player", "specialattack", attackValue);

			// Set specialAttackAttacked to true before resetting
			this.specialAttackAttacked = true;

			this.attackPlayer();
			setTimeout(() => {
				this.resetAttackedStatus();
			}, 300);
		},

		healPlayer() {
			this.currentRound++;
			this.healAnimation = true;

			const healValue = getrandomvalue(25, 35);
			if (this.playerHealth + healValue > 100) {
				this.playerHealth = 100;
			} else {
				this.playerHealth += healValue;
			}
			this.addLogMessage("player", "heal", healValue);
			this.attackPlayer();

			setTimeout(() => {
				this.healAnimation = false;
			}, 1000);
		},

		surrender() {
			this.winner = "monster";
			this.surrenderAnimation = true;
		},

		resetGame() {
			this.gameStarted = false;
			this.playerSelect = true;
			this.isLogEmpty = true;
			this.clearLog();
		},

		addLogMessage(who, what, value) {
			const attackerName =
				who === "player"
					? this.playerName + "'s " + this.playerMonsterName
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

		confirmPlayer() {
			this.playerSelect = false;
			this.monsterSelect = true;
			console.log("Player selected true");
		}
	},

	computed: {
		getBarStyles() {
			return (value, maxHealth) => {
				const percentage = (value / maxHealth) * 100;

				if (value <= maxHealth * 0.3 && value > 0) {
					return { "background-color": "red", width: percentage + "%" };
				} else if (value > maxHealth * 0.3 && value <= maxHealth * 0.5) {
					return { "background-color": "orange", width: percentage + "%" };
				} else if (value <= 0) {
					return { width: "0%" };
				} else {
					return { width: percentage + "%" };
				}
			};
		},
		playerBarStyles() {
			return this.getBarStyles(this.playerHealth, 100); // Assuming player max health is always 100
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
      return this.enemyMonsters.slice().sort((a, b) => a.number - b.number);
    },
	}
});

app.mount("#game");
