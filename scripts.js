
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
				name: 'MewTwo',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/150.png',
				health: 120,
				number: '0151',
				size: 'm',
                type: 'psychic'
			},
			{
				name: 'Mew',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/151.png',
				health: 120,
				number: '0150',
				size: 's',
                type: 'psychic'
			},
			{
				name: 'Bulbasaur',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png',
				health: 80,
				number: '0001',
				size: 's',
                type: 'grass'
			},
			{
				name: 'Ivysaur',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/002.png',
				health: 100,
				number: '0002',
				size: 'm',
				type: 'grass'
			},
			{
				name: 'Venusaur',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/003.png',
				health: 180,
				number: '0003',
				size: 'l',
                type: 'grass'
			},
			{
				name: 'Charmander',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png',
				health: 80,
				number: '0004',
				size: 's',
                type: 'fire'
			},
			{
				name: 'Charmeleon',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/005.png',
				health: 100,
				number: '0005',
				size: 'm',
				type: 'fire'
			},
			{
				name: 'Charizard',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png',
				health: 180,
				number: '0006',
				size: 'l',
                type: 'fire'
			},
			{
				name: 'Squirtle',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png',
				health: 80,
				number: '0007',
				size: 's',
                type: 'water'
			},
			{
				name: 'Wartortle',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/008.png',
				health: 100,
				number: '0008',
				size: 'm',
				type: 'water'
			},
			{
				name: 'Gastly',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/092.png',
				health: 80,
				number: '0092',
				size: 'm',
				type: 'ghost'
			},
			{
				name: 'Blastoise',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/009.png',
				health: 180,
				number: '0009',
				size: 'l',
                type: 'water'
			},
			{
				name: 'Caterpie',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/010.png',
				health: 40,
				number: '0010',
				size: 's',
				type: 'bug'
			},
			{
				name: 'Metapod',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/011.png',
				health: 60,
				number: '0011',
				size: 'm',
				type: 'bug'
			},
			{
				name: 'Butterfree',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/012.png',
				health: 120,
				number: '0012',
				size: 'l',
				type: 'bug'
			},
			{
				name: 'Weedle',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/013.png',
				health: 40,
				number: '0013',
				size: 's',
				type: 'bug'
			},
			{
				name: 'Kakuna',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/014.png',
				health: 60,
				number: '0014',
				size: 'm',
				type: 'bug'
			},
			{
				name: 'Beedrill',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/015.png',
				health: 120,
				number: '0015',
				size: 'l',
				type: 'bug'
			},
			{
				name: 'Beedrill',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/015.png',
				health: 120,
				number: '0015',
				size: 'l',
				type: 'bug'
			},
			{
				name: 'Pidgey',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/016.png',
				health: 60,
				number: '0016',
				size: 's',
				type: 'flying'
			},
			{
				name: 'Pidgeotto',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/017.png',
				health: 80,
				number: '0017',
				size: 'm',
				type: 'flying'
			},
			{
				name: 'Pidgeot',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/018.png',
				health: 140,
				number: '0018',
				size: 'l',
				type: 'flying'
			},
			{
				name: 'Rattata',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/019.png',
				health: 40,
				number: '0019',
				size: 's',
				type: 'normal'
			},
			{
				name: 'Raticate',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/020.png',
				health: 80,
				number: '0020',
				size: 'm',
				type: 'normal'
			},
			{
				name: 'Spearow',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/021.png',
				health: 60,
				number: '0021',
				size: 's',
				type: 'flying'
			},
			{
				name: 'Fearow',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/022.png',
				health: 120,
				number: '0022',
				size: 'l',
				type: 'flying'
			},
			{
				name: 'Ekans',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/023.png',
				health: 70,
				number: '0023',
				size: 'm',
				type: 'poison'
			},
			{
				name: 'Arbok',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/024.png',
				health: 120,
				number: '0024',
				size: 'l',
				type: 'poison'
			},
			{
				name: 'Pikachu',
				image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png",
				number: '0025',
				size: 's',
				type: 'electric'
			},
			{
				name: 'Raichu',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/026.png',
				health: 120,
				number: '0026',
				size: 'm',
				type: 'electric'
			},
			{
				name: 'Sandshrew',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/027.png',
				health: 60,
				number: '0027',
				size: 's',
				type: 'ground'
			},
			{
				name: 'Sandslash',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/028.png',
				health: 120,
				number: '0028',
				size: 'm',
				type: 'ground'
			},
			{
				name: 'Nidoran♀',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/029.png',
				health: 70,
				number: '0029',
				size: 's',
				type: 'poison'
			},
			{
				name: 'Nidorina',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/030.png',
				health: 100,
				number: '0030',
				size: 'm',
				type: 'poison'
			},
			{
				name: 'Nidoqueen',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/031.png',
				health: 180,
				number: '0031',
				size: 'l',
				type: 'poison'
			},
			{
				name: 'Nidoran♂',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/032.png',
				health: 70,
				number: '0032',
				size: 's',
				type: 'poison'
			},
			{
				name: 'Nidorino',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/033.png',
				health: 100,
				number: '0033',
				size: 'm',
				type: 'poison'
			},
			{
				name: 'Nidoking',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/034.png',
				health: 180,
				number: '0034',
				size: 'l',
				type: 'poison'
			},
			{
				name: 'Clefairy',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/035.png',
				health: 120,
				number: '0035',
				size: 'm',
				type: 'fairy'
			},
			{
				name: 'Clefable',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/036.png',
				health: 180,
				number: '0036',
				size: 'l',
				type: 'fairy'
			},
			{
				name: 'Vulpix',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/037.png',
				health: 80,
				number: '0037',
				size: 's',
				type: 'fire'
			},
			{
				name: 'Ninetales',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/038.png',
				health: 140,
				number: '0038',
				size: 'l',
				type: 'fire'
			},
			{
				name: 'Jigglypuff',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/039.png',
				health: 120,
				number: '0039',
				size: 'm',
				type: 'normal'
			},
			{
				name: 'Wigglytuff',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/040.png',
				health: 180,
				number: '0040',
				size: 'l',
				type: 'normal'
			},
			{
				name: 'Zubat',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/041.png',
				health: 60,
				number: '0041',
				size: 's',
				type: 'poison'
			},
			{
				name: 'Golbat',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/042.png',
				health: 120,
				number: '0042',
				size: 'l',
				type: 'poison'
			},
			{
				name: 'Oddish',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/043.png',
				health: 80,
				number: '0043',
				size: 's',
				type: 'grass'
			},
			{
				name: 'Gloom',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/044.png',
				health: 120,
				number: '0044',
				size: 'm',
				type: 'grass'
			},
			{
				name: 'Vileplume',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/045.png',
				health: 180,
				number: '0045',
				size: 'l',
				type: 'grass'
			},
			{
				name: 'Paras',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/046.png',
				health: 70,
				number: '0046',
				size: 's',
				type: 'bug'
			},
			{
				name: 'Parasect',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/047.png',
				health: 120,
				number: '0047',
				size: 'm',
				type: 'bug'
			},
			{
				name: 'Venonat',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/048.png',
				health: 80,
				number: '0048',
				size: 's',
				type: 'bug'
			},
			{
				name: 'Venomoth',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/049.png',
				health: 140,
				number: '0049',
				size: 'l',
				type: 'bug'
			},
			{
				name: 'Diglett',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/050.png',
				health: 60,
				number: '0050',
				size: 's',
				type: 'ground'
			},
			{
				name: 'Dugtrio',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/051.png',
				health: 120,
				number: '0051',
				size: 'm',
				type: 'ground'
			},
			{
				name: 'Meowth',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/052.png',
				health: 80,
				number: '0052',
				size: 's',
				type: 'normal'
			},
			{
				name: 'Persian',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/053.png',
				health: 140,
				number: '0053',
				size: 'm',
				type: 'normal'
			},
			{
				name: 'Psyduck',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/054.png',
				health: 80,
				number: '0054',
				size: 's',
				type: 'water'
			},
			{
				name: 'Golduck',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/055.png',
				health: 140,
				number: '0055',
				size: 'm',
				type: 'water'
			},
			{
				name: 'Mankey',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/056.png',
				health: 80,
				number: '0056',
				size: 's',
				type: 'fighting'
			},
			{
				name: 'Primeape',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/057.png',
				health: 120,
				number: '0057',
				size: 'm',
				type: 'fighting'
			},
			{
				name: 'Growlithe',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/058.png',
				health: 90,
				number: '0058',
				size: 's',
				type: 'fire'
			},
			{
				name: 'Arcanine',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/059.png',
				health: 160,
				number: '0059',
				size: 'l',
				type: 'fire'
			},
			{
				name: 'Poliwag',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/060.png',
				health: 80,
				number: '0060',
				size: 's',
				type: 'water'
			},
			{
				name: 'Poliwhirl',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/061.png',
				health: 120,
				number: '0061',
				size: 'm',
				type: 'water'
			},
			{
				name: 'Poliwrath',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/062.png',
				health: 180,
				number: '0062',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Abra',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/063.png',
				health: 60,
				number: '0063',
				size: 's',
				type: 'psychic'
			},
			{
				name: 'Kadabra',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/064.png',
				health: 120,
				number: '0064',
				size: 'm',
				type: 'psychic'
			},
			{
				name: 'Alakazam',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/065.png',
				health: 180,
				number: '0065',
				size: 'm',
                type: 'psychic'
			},
			{
				name: 'Machop',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/066.png',
				health: 80,
				number: '0066',
				size: 's',
				type: 'fighting'
			},
			{
				name: 'Machoke',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/067.png',
				health: 140,
				number: '0067',
				size: 'm',
				type: 'fighting'
			},
			{
				name: 'Machamp',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/068.png',
				health: 180,
				number: '0068',
				size: 'l',
				type: 'fighting'
			},
			{
				name: 'Bellsprout',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/069.png',
				health: 80,
				number: '0069',
				size: 's',
				type: 'grass'
			},
			{
				name: 'Weepinbell',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/070.png',
				health: 120,
				number: '0070',
				size: 'm',
				type: 'grass'
			},
			{
				name: 'Victreebel',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/071.png',
				health: 180,
				number: '0071',
				size: 'l',
				type: 'grass'
			},
			{
				name: 'Tentacool',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/072.png',
				health: 90,
				number: '0072',
				size: 's',
				type: 'water'
			},
			{
				name: 'Tentacruel',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/073.png',
				health: 150,
				number: '0073',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Geodude',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/074.png',
				health: 90,
				number: '0074',
				size: 's',
				type: 'rock'
			},
			{
				name: 'Graveler',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/075.png',
				health: 140,
				number: '0075',
				size: 'm',
				type: 'rock'
			},
			{
				name: 'Golem',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/076.png',
				health: 180,
				number: '0076',
				size: 'l',
				type: 'rock'
			},
			{
				name: 'Ponyta',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/077.png',
				health: 90,
				number: '0077',
				size: 's',
				type: 'fire'
			},
			{
				name: 'Rapidash',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/078.png',
				health: 160,
				number: '0078',
				size: 'l',
				type: 'fire'
			},
			{
				name: 'Slowpoke',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/079.png',
				health: 120,
				number: '0079',
				size: 'm',
				type: 'water'
			},
			{
				name: 'Slowbro',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/080.png',
				health: 180,
				number: '0080',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Magnemite',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/081.png',
				health: 80,
				number: '0081',
				size: 's',
				type: 'electric'
			},
			{
				name: 'Magneton',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/082.png',
				health: 140,
				number: '0082',
				size: 'm',
				type: 'electric'
			},
			{
				name: 'Farfetch\'d',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/083.png',
				health: 120,
				number: '0083',
				size: 'm',
				type: 'normal'
			},
			{
				name: 'Doduo',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/084.png',
				health: 80,
				number: '0084',
				size: 's',
				type: 'normal'
			},
			{
				name: 'Dodrio',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/085.png',
				health: 160,
				number: '0085',
				size: 'l',
				type: 'normal'
			},
			{
				name: 'Seel',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/086.png',
				health: 100,
				number: '0086',
				size: 'm',
				type: 'water'
			},
			{
				name: 'Dewgong',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/087.png',
				health: 160,
				number: '0087',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Grimer',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/088.png',
				health: 90,
				number: '0088',
				size: 's',
				type: 'poison'
			},
			{
				name: 'Muk',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/089.png',
				health: 160,
				number: '0089',
				size: 'l',
				type: 'poison'
			},
			{
				name: 'Shellder',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/090.png',
				health: 90,
				number: '0090',
				size: 's',
				type: 'water'
			},
			{
				name: 'Cloyster',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/091.png',
				health: 160,
				number: '0091',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Gastly',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/092.png',
				health: 60,
				number: '0092',
				size: 's',
				type: 'ghost'
			},
			{
				name: 'Haunter',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/093.png',
				health: 120,
				number: '0093',
				size: 'm',
				type: 'ghost'
			},
			{
				name: 'Gengar',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/094.png',
				health: 160,
				number: '0094',
				size: 'l',
				type: 'ghost'
			},
			{
				name: 'Onix',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/095.png',
				health: 180,
				number: '0095',
				size: 'l',
				type: 'rock'
			},
			{
				name: 'Drowzee',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/096.png',
				health: 120,
				number: '0096',
				size: 'm',
				type: 'psychic'
			},
			{
				name: 'Hypno',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/097.png',
				health: 160,
				number: '0097',
				size: 'l',
				type: 'psychic'
			},
			{
				name: 'Krabby',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/098.png',
				health: 90,
				number: '0098',
				size: 's',
				type: 'water'
			},
			{
				name: 'Kingler',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/099.png',
				health: 160,
				number: '0099',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Voltorb',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/100.png',
				health: 80,
				number: '0100',
				size: 's',
				type: 'electric'
			},
			{
				name: 'Electrode',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/101.png',
				health: 140,
				number: '0101',
				size: 'm',
				type: 'electric'
			},
			{
				name: 'Exeggcute',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/102.png',
				health: 80,
				number: '0102',
				size: 's',
				type: 'grass'
			},
			{
				name: 'Exeggutor',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/103.png',
				health: 180,
				number: '0103',
				size: 'l',
				type: 'grass'
			},
			{
				name: 'Cubone',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/104.png',
				health: 100,
				number: '0104',
				size: 's',
				type: 'ground'
			},
			{
				name: 'Marowak',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/105.png',
				health: 160,
				number: '0105',
				size: 'l',
				type: 'ground'
			},
			{
				name: 'Hitmonlee',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/106.png',
				health: 160,
				number: '0106',
				size: 'l',
				type: 'fighting'
			},
			{
				name: 'Hitmonchan',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/107.png',
				health: 160,
				number: '0107',
				size: 'l',
				type: 'fighting'
			},
			{
				name: 'Lickitung',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/108.png',
				health: 180,
				number: '0108',
				size: 'l',
				type: 'normal'
			},
			{
				name: 'Koffing',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/109.png',
				health: 90,
				number: '0109',
				size: 's',
				type: 'poison'
			},
			{
				name: 'Weezing',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/110.png',
				health: 160,
				number: '0110',
				size: 'l',
				type: 'poison'
			},
			{
				name: 'Rhyhorn',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/111.png',
				health: 140,
				number: '0111',
				size: 'm',
				type: 'ground'
			},
			{
				name: 'Rhydon',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/112.png',
				health: 180,
				number: '0112',
				size: 'l',
				type: 'ground'
			},
			{
				name: 'Chansey',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/113.png',
				health: 250,
				number: '0113',
				size: 'xl',
				type: 'normal'
			},
			{
				name: 'Tangela',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/114.png',
				health: 130,
				number: '0114',
				size: 'm',
				type: 'grass'
			},
			{
				name: 'Kangaskhan',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/115.png',
				health: 210,
				number: '0115',
				size: 'xl',
				type: 'normal'
			},
			{
				name: 'Horsea',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/116.png',
				health: 80,
				number: '0116',
				size: 's',
				type: 'water'
			},
			{
				name: 'Seadra',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/117.png',
				health: 140,
				number: '0117',
				size: 'm',
				type: 'water'
			},
			{
				name: 'Goldeen',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/118.png',
				health: 90,
				number: '0118',
				size: 's',
				type: 'water'
			},
			{
				name: 'Seaking',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/119.png',
				health: 160,
				number: '0119',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Staryu',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/120.png',
				health: 80,
				number: '0120',
				size: 's',
				type: 'water'
			},
			{
				name: 'Starmie',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/121.png',
				health: 160,
				number: '0121',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Mr. Mime',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/122.png',
				health: 160,
				number: '0122',
				size: 'l',
				type: 'psychic'
			},	
			{
				name: 'Scyther',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/123.png',
				health: 160,
				number: '0123',
				size: 'l',
				type: 'bug'
			},
			{
				name: 'Jynx',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/124.png',
				health: 180,
				number: '0124',
				size: 'l',
				type: 'ice'
			},
			{
				name: 'Electabuzz',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/125.png',
				health: 180,
				number: '0125',
				size: 'l',
				type: 'electric'
			},
			{
				name: 'Magmar',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/126.png',
				health: 180,
				number: '0126',
				size: 'l',
				type: 'fire'
			},
			{
				name: 'Pinsir',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/127.png',
				health: 160,
				number: '0127',
				size: 'l',
				type: 'bug'
			},
			{
				name: 'Tauros',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/128.png',
				health: 180,
				number: '0128',
				size: 'l',
				type: 'normal'
			},			
			{
				name: 'Magikarp',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/129.png',
				health: 30,
				number: '0129',
				size: 's',
                type: 'water'
			},
			{
				name: 'Gyarados',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/130.png',
				health: 120,
				number: '0130',
				size: 'm',
				type: 'dragon'
			},		
			{
				name: 'Lapras',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/131.png',
				health: 220,
				number: '0131',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Ditto',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/132.png',
				health: 80,
				number: '0132',
				size: 's',
				type: 'normal'
			},
			{
				name: 'Eevee',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/133.png',
				health: 120,
				number: '0133',
				size: 'm',
				type: 'normal'
			},
			{
				name: 'Vaporeon',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/134.png',
				health: 220,
				number: '0134',
				size: 'l',
				type: 'water'
			},
			{
				name: 'Jolteon',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/135.png',
				health: 180,
				number: '0135',
				size: 'l',
				type: 'electric'
			},
			{
				name: 'Flareon',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/136.png',
				health: 180,
				number: '0136',
				size: 'l',
				type: 'fire'
			},
			{
				name: 'Porygon',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/137.png',
				health: 120,
				number: '0137',
				size: 'm',
				type: 'normal'
			},
			{
				name: 'Omanyte',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/138.png',
				health: 160,
				number: '0138',
				size: 's',
				type: 'rock'
			},
			{
				name: 'Omastar',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/139.png',
				health: 200,
				number: '0139',
				size: 'm',
				type: 'rock'
			},
			{
				name: 'Kabuto',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/140.png',
				number: '0140',
				size: 's',
				type: 'rock'
			},
			{
				name: 'Kabutops',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/141.png',
				health: 200,
				number: '0141',
				size: 'm',
				type: 'rock'
			},
			{
				name: 'Aerodactyl',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/142.png',
				health: 200,
				number: '0142',
				size: 'l',
				type: 'rock'
			},
			{
				name: 'Snorlax',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png',
				health: 320,
				number: '0143',
				size: 'xl',
				type: 'normal'
			},
			{
				name: 'Articuno',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/144.png',
				health: 280,
				number: '0144',
				size: 'l',
				type: 'ice'
			},
			{
				name: 'Zapdos',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/145.png',
				health: 280,
				number: '0145',
				size: 'l',
				type: 'electric'
			},
			{
				name: 'Moltres',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/146.png',
				health: 220,
				number: '0146',
				size: 'l',
				type: 'fire'
			},
			{
				name: 'Dratini',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/147.png',
				health: 120,
				number: '0147',
				size: 's',
				type: 'dragon'
			},
			{
				name: 'Dragonair',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/148.png',
				health: 160,
				number: '0148',
				size: 'm',
				type: 'dragon'
			},
			{
				name: 'Dragonite',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/149.png',
				health: 180,
				number: '0149',
				size: 'l',
                type: 'dragon'
			},
			{
				name: 'Articuno',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/144.png',
				health: 220,
				number: '0144',
				size: 'l',
				type: 'ice'
			},
			{
				name: 'Togepi',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/175.png',
				health: 120,
				number: '0175',
				size: 's',
				type: 'fairy'
			},
			{
				name: 'Lugia',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/249.png',
				health: 220,
				number: '0249',
				size: 'l',
				type: 'psychic'
			},
			{
				name: 'Ho-Oh',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/250.png',
				health: 220,
				number: '0250',
				size: 'xl',
				type: 'fire'
			},
			{
				name: 'Eternatus',
				image: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/890.png',
				health: 320,
				number: '0890',
				size: 'xl',
                type: 'dragon'
			},
		];

		return {
			enemyMonsters,
			currentEnemyMonster: null,
			currentPlayerMonster: null,
			enemyMonster: null,
			gameStarted: null,
			playerHealth: 100,
			monsterHealth: 100,
			enemyMonsterHealth: 0,
			currentRound: 0,
			winner: null,
			logMessages: [],
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
	
			// Check if there's a selected enemy monster
			if (this.currentEnemyMonster) {
				// If there is, use the selected enemy monster
				this.currentEnemyMonster = this.currentEnemyMonster;
			} else {
				// If not, default to the first enemy monster in the list
				this.currentEnemyMonster = this.enemyMonsters[0];
			}
	
			// Check if there's a selected player monster
			if (this.currentPlayerMonster) {
				// If there is, use the selected player monster
				this.currentPlayerMonster = this.currentPlayerMonster;
				console.log("Selected Player Monster: " + this.currentPlayerMonster.name);
			} else {
				// If not, default to the first player monster in the list
				this.currentPlayerMonster = this.enemyMonsters[0]; // Change this to the correct array
				console.log("Default Player Monster: " + this.currentPlayerMonster.name);
			}
	
			this.enemyMonsterHealth = this.currentEnemyMonster.health;

		if (this.selectPlayerMonster) {
			currentPlayerMonster = this.playerMonster;
			console.log(this.selectPlayerMonster.name);
		}

        this.enemyMonsterHealth = this.currentEnemyMonster.health;
        },

		selectPlayerMonster(playerMonster) {
			this.currentPlayerMonster = playerMonster; // Update this line
			this.playerSelect = false;
			this.monsterSelect = true;
			console.log(this.currentPlayerMonster.name);
		},
		
		selectEnemyMonster(enemyMonster) {
			this.currentEnemyMonster = enemyMonster; // Update this line
			this.monsterSelect = false;
			console.log(this.currentEnemyMonster.name);
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
