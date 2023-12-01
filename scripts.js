
function getrandomvalue(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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
			playerName: "Ash",
			playerAttacked: false,
			monsterAttacked: false,
			specialAttackAttacked: false,
			healAnimation: false,
			surrenderAnimation: false
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
			this.playerHealth = 100;
			this.monsterHealth = 100;
			this.enemyMonsterHealth = 0;
			this.winner = null;
			this.currentRound = 0;
			this.surrenderAnimation = false;
			this.clearLog();
			console.log("StartGame")

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
