const monstersList = [
    {
        name: 'MewTwo',
        image: '150.png',
        health: 120,
        number: '0151',
        size: 'm',
        type: 'psychic'
    },
    {
        name: 'Mew',
        image: '151.png',
        health: 120,
        number: '0150',
        size: 's',
        type: 'psychic'
    },
    {
        name: 'Bulbasaur',
        image: '001.png',
        health: 80,
        number: '0001',
        size: 's',
        type: 'grass'
    },
    {
        name: 'Ivysaur',
        image: '002.png',
        health: 100,
        number: '0002',
        size: 'm',
        type: 'grass'
    },
    {
        name: 'Venusaur',
        image: '003.png',
        health: 180,
        number: '0003',
        size: 'l',
        type: 'grass'
    },
    {
        name: 'Charmander',
        image: '004.png',
        health: 80,
        number: '0004',
        size: 's',
        type: 'fire'
    },
    {
        name: 'Charmeleon',
        image: '005.png',
        health: 100,
        number: '0005',
        size: 'm',
        type: 'fire'
    },
    {
        name: 'Charizard',
        image: '006.png',
        health: 180,
        number: '0006',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Squirtle',
        image: '007.png',
        health: 80,
        number: '0007',
        size: 's',
        type: 'water'
    },
    {
        name: 'Wartortle',
        image: '008.png',
        health: 100,
        number: '0008',
        size: 'm',
        type: 'water'
    },
    {
        name: 'Blastoise',
        image: '009.png',
        health: 180,
        number: '0009',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Caterpie',
        image: '010.png',
        health: 40,
        number: '0010',
        size: 's',
        type: 'bug'
    },
    {
        name: 'Metapod',
        image: '011.png',
        health: 60,
        number: '0011',
        size: 'm',
        type: 'bug'
    },
    {
        name: 'Butterfree',
        image: '012.png',
        health: 120,
        number: '0012',
        size: 'l',
        type: 'bug'
    },
    {
        name: 'Weedle',
        image: '013.png',
        health: 40,
        number: '0013',
        size: 's',
        type: 'bug'
    },
    {
        name: 'Kakuna',
        image: '014.png',
        health: 60,
        number: '0014',
        size: 'm',
        type: 'bug'
    },
    {
        name: 'Beedrill',
        image: '015.png',
        health: 120,
        number: '0015',
        size: 'l',
        type: 'bug'
    },
    {
        name: 'Beedrill',
        image: '015.png',
        health: 120,
        number: '0015',
        size: 'l',
        type: 'bug'
    },
    {
        name: 'Pidgey',
        image: '016.png',
        health: 60,
        number: '0016',
        size: 's',
        type: 'flying'
    },
    {
        name: 'Pidgeotto',
        image: '017.png',
        health: 80,
        number: '0017',
        size: 'm',
        type: 'flying'
    },
    {
        name: 'Pidgeot',
        image: '018.png',
        health: 140,
        number: '0018',
        size: 'l',
        type: 'flying'
    },
    {
        name: 'Rattata',
        image: '019.png',
        health: 40,
        number: '0019',
        size: 's',
        type: 'normal'
    },
    {
        name: 'Raticate',
        image: '020.png',
        health: 80,
        number: '0020',
        size: 'm',
        type: 'normal'
    },
    {
        name: 'Spearow',
        image: '021.png',
        health: 60,
        number: '0021',
        size: 's',
        type: 'flying'
    },
    {
        name: 'Fearow',
        image: '022.png',
        health: 120,
        number: '0022',
        size: 'l',
        type: 'flying'
    },
    {
        name: 'Ekans',
        image: '023.png',
        health: 70,
        number: '0023',
        size: 'm',
        type: 'poison'
    },
    {
        name: 'Arbok',
        image: '024.png',
        health: 120,
        number: '0024',
        size: 'l',
        type: 'poison'
    },
    {
        name: 'Pikachu',
        image: "025.png",
        number: '0025',
        size: 's',
        type: 'electric'
    },
    {
        name: 'Raichu',
        image: '026.png',
        health: 120,
        number: '0026',
        size: 'm',
        type: 'electric'
    },
    {
        name: 'Sandshrew',
        image: '027.png',
        health: 60,
        number: '0027',
        size: 's',
        type: 'ground'
    },
    {
        name: 'Sandslash',
        image: '028.png',
        health: 120,
        number: '0028',
        size: 'm',
        type: 'ground'
    },
    {
        name: 'Nidoran♀',
        image: '029.png',
        health: 70,
        number: '0029',
        size: 's',
        type: 'poison'
    },
    {
        name: 'Nidorina',
        image: '030.png',
        health: 100,
        number: '0030',
        size: 'm',
        type: 'poison'
    },
    {
        name: 'Nidoqueen',
        image: '031.png',
        health: 180,
        number: '0031',
        size: 'l',
        type: 'poison'
    },
    {
        name: 'Nidoran♂',
        image: '032.png',
        health: 70,
        number: '0032',
        size: 's',
        type: 'poison'
    },
    {
        name: 'Nidorino',
        image: '033.png',
        health: 100,
        number: '0033',
        size: 'm',
        type: 'poison'
    },
    {
        name: 'Nidoking',
        image: '034.png',
        health: 180,
        number: '0034',
        size: 'l',
        type: 'poison'
    },
    {
        name: 'Clefairy',
        image: '035.png',
        health: 120,
        number: '0035',
        size: 'm',
        type: 'fairy'
    },
    {
        name: 'Clefable',
        image: '036.png',
        health: 180,
        number: '0036',
        size: 'l',
        type: 'fairy'
    },
    {
        name: 'Vulpix',
        image: '037.png',
        health: 80,
        number: '0037',
        size: 's',
        type: 'fire'
    },
    {
        name: 'Ninetales',
        image: '038.png',
        health: 140,
        number: '0038',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Jigglypuff',
        image: '039.png',
        health: 120,
        number: '0039',
        size: 'm',
        type: 'normal'
    },
    {
        name: 'Wigglytuff',
        image: '040.png',
        health: 180,
        number: '0040',
        size: 'l',
        type: 'normal'
    },
    {
        name: 'Zubat',
        image: '041.png',
        health: 60,
        number: '0041',
        size: 's',
        type: 'poison'
    },
    {
        name: 'Golbat',
        image: '042.png',
        health: 120,
        number: '0042',
        size: 'l',
        type: 'poison'
    },
    {
        name: 'Oddish',
        image: '043.png',
        health: 80,
        number: '0043',
        size: 's',
        type: 'grass'
    },
    {
        name: 'Gloom',
        image: '044.png',
        health: 120,
        number: '0044',
        size: 'm',
        type: 'grass'
    },
    {
        name: 'Vileplume',
        image: '045.png',
        health: 180,
        number: '0045',
        size: 'l',
        type: 'grass'
    },
    {
        name: 'Paras',
        image: '046.png',
        health: 70,
        number: '0046',
        size: 's',
        type: 'bug'
    },
    {
        name: 'Parasect',
        image: '047.png',
        health: 120,
        number: '0047',
        size: 'm',
        type: 'bug'
    },
    {
        name: 'Venonat',
        image: '048.png',
        health: 80,
        number: '0048',
        size: 's',
        type: 'bug'
    },
    {
        name: 'Venomoth',
        image: '049.png',
        health: 140,
        number: '0049',
        size: 'l',
        type: 'bug'
    },
    {
        name: 'Diglett',
        image: '050.png',
        health: 60,
        number: '0050',
        size: 's',
        type: 'ground'
    },
    {
        name: 'Dugtrio',
        image: '051.png',
        health: 120,
        number: '0051',
        size: 'm',
        type: 'ground'
    },
    {
        name: 'Meowth',
        image: '052.png',
        health: 80,
        number: '0052',
        size: 's',
        type: 'normal'
    },
    {
        name: 'Persian',
        image: '053.png',
        health: 140,
        number: '0053',
        size: 'm',
        type: 'normal'
    },
    {
        name: 'Psyduck',
        image: '054.png',
        health: 80,
        number: '0054',
        size: 's',
        type: 'water'
    },
    {
        name: 'Golduck',
        image: '055.png',
        health: 140,
        number: '0055',
        size: 'm',
        type: 'water'
    },
    {
        name: 'Mankey',
        image: '056.png',
        health: 80,
        number: '0056',
        size: 's',
        type: 'fighting'
    },
    {
        name: 'Primeape',
        image: '057.png',
        health: 120,
        number: '0057',
        size: 'm',
        type: 'fighting'
    },
    {
        name: 'Growlithe',
        image: '058.png',
        health: 90,
        number: '0058',
        size: 's',
        type: 'fire'
    },
    {
        name: 'Arcanine',
        image: '059.png',
        health: 160,
        number: '0059',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Poliwag',
        image: '060.png',
        health: 80,
        number: '0060',
        size: 's',
        type: 'water'
    },
    {
        name: 'Poliwhirl',
        image: '061.png',
        health: 120,
        number: '0061',
        size: 'm',
        type: 'water'
    },
    {
        name: 'Poliwrath',
        image: '062.png',
        health: 180,
        number: '0062',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Abra',
        image: '063.png',
        health: 60,
        number: '0063',
        size: 's',
        type: 'psychic'
    },
    {
        name: 'Kadabra',
        image: '064.png',
        health: 120,
        number: '0064',
        size: 'm',
        type: 'psychic'
    },
    {
        name: 'Alakazam',
        image: '065.png',
        health: 180,
        number: '0065',
        size: 'm',
        type: 'psychic'
    },
    {
        name: 'Machop',
        image: '066.png',
        health: 80,
        number: '0066',
        size: 's',
        type: 'fighting'
    },
    {
        name: 'Machoke',
        image: '067.png',
        health: 140,
        number: '0067',
        size: 'm',
        type: 'fighting'
    },
    {
        name: 'Machamp',
        image: '068.png',
        health: 180,
        number: '0068',
        size: 'l',
        type: 'fighting'
    },
    {
        name: 'Bellsprout',
        image: '069.png',
        health: 80,
        number: '0069',
        size: 's',
        type: 'grass'
    },
    {
        name: 'Weepinbell',
        image: '070.png',
        health: 120,
        number: '0070',
        size: 'm',
        type: 'grass'
    },
    {
        name: 'Victreebel',
        image: '071.png',
        health: 180,
        number: '0071',
        size: 'l',
        type: 'grass'
    },
    {
        name: 'Tentacool',
        image: '072.png',
        health: 90,
        number: '0072',
        size: 's',
        type: 'water'
    },
    {
        name: 'Tentacruel',
        image: '073.png',
        health: 150,
        number: '0073',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Geodude',
        image: '074.png',
        health: 90,
        number: '0074',
        size: 's',
        type: 'rock'
    },
    {
        name: 'Graveler',
        image: '075.png',
        health: 140,
        number: '0075',
        size: 'm',
        type: 'rock'
    },
    {
        name: 'Golem',
        image: '076.png',
        health: 180,
        number: '0076',
        size: 'l',
        type: 'rock'
    },
    {
        name: 'Ponyta',
        image: '077.png',
        health: 90,
        number: '0077',
        size: 's',
        type: 'fire'
    },
    {
        name: 'Rapidash',
        image: '078.png',
        health: 160,
        number: '0078',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Slowpoke',
        image: '079.png',
        health: 120,
        number: '0079',
        size: 'm',
        type: 'water'
    },
    {
        name: 'Slowbro',
        image: '080.png',
        health: 180,
        number: '0080',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Magnemite',
        image: '081.png',
        health: 80,
        number: '0081',
        size: 's',
        type: 'electric'
    },
    {
        name: 'Magneton',
        image: '082.png',
        health: 140,
        number: '0082',
        size: 'm',
        type: 'electric'
    },
    {
        name: 'Farfetch\'d',
        image: '083.png',
        health: 120,
        number: '0083',
        size: 'm',
        type: 'normal'
    },
    {
        name: 'Doduo',
        image: '084.png',
        health: 80,
        number: '0084',
        size: 's',
        type: 'normal'
    },
    {
        name: 'Dodrio',
        image: '085.png',
        health: 160,
        number: '0085',
        size: 'l',
        type: 'normal'
    },
    {
        name: 'Seel',
        image: '086.png',
        health: 100,
        number: '0086',
        size: 'm',
        type: 'water'
    },
    {
        name: 'Dewgong',
        image: '087.png',
        health: 160,
        number: '0087',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Grimer',
        image: '088.png',
        health: 90,
        number: '0088',
        size: 's',
        type: 'poison'
    },
    {
        name: 'Muk',
        image: '089.png',
        health: 160,
        number: '0089',
        size: 'l',
        type: 'poison'
    },
    {
        name: 'Shellder',
        image: '090.png',
        health: 90,
        number: '0090',
        size: 's',
        type: 'water'
    },
    {
        name: 'Cloyster',
        image: '091.png',
        health: 160,
        number: '0091',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Gastly',
        image: '092.png',
        health: 60,
        number: '0092',
        size: 's',
        type: 'ghost'
    },
    {
        name: 'Haunter',
        image: '093.png',
        health: 120,
        number: '0093',
        size: 'm',
        type: 'ghost'
    },
    {
        name: 'Gengar',
        image: '094.png',
        health: 160,
        number: '0094',
        size: 'l',
        type: 'ghost'
    },
    {
        name: 'Onix',
        image: '095.png',
        health: 180,
        number: '0095',
        size: 'l',
        type: 'rock'
    },
    {
        name: 'Drowzee',
        image: '096.png',
        health: 120,
        number: '0096',
        size: 'm',
        type: 'psychic'
    },
    {
        name: 'Hypno',
        image: '097.png',
        health: 160,
        number: '0097',
        size: 'l',
        type: 'psychic'
    },
    {
        name: 'Krabby',
        image: '098.png',
        health: 90,
        number: '0098',
        size: 's',
        type: 'water'
    },
    {
        name: 'Kingler',
        image: '099.png',
        health: 160,
        number: '0099',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Voltorb',
        image: '100.png',
        health: 80,
        number: '0100',
        size: 's',
        type: 'electric'
    },
    {
        name: 'Electrode',
        image: '101.png',
        health: 140,
        number: '0101',
        size: 'm',
        type: 'electric'
    },
    {
        name: 'Exeggcute',
        image: '102.png',
        health: 80,
        number: '0102',
        size: 's',
        type: 'grass'
    },
    {
        name: 'Exeggutor',
        image: '103.png',
        health: 180,
        number: '0103',
        size: 'l',
        type: 'grass'
    },
    {
        name: 'Cubone',
        image: '104.png',
        health: 100,
        number: '0104',
        size: 's',
        type: 'ground'
    },
    {
        name: 'Marowak',
        image: '105.png',
        health: 160,
        number: '0105',
        size: 'l',
        type: 'ground'
    },
    {
        name: 'Hitmonlee',
        image: '106.png',
        health: 160,
        number: '0106',
        size: 'l',
        type: 'fighting'
    },
    {
        name: 'Hitmonchan',
        image: '107.png',
        health: 160,
        number: '0107',
        size: 'l',
        type: 'fighting'
    },
    {
        name: 'Lickitung',
        image: '108.png',
        health: 180,
        number: '0108',
        size: 'l',
        type: 'normal'
    },
    {
        name: 'Koffing',
        image: '109.png',
        health: 90,
        number: '0109',
        size: 's',
        type: 'poison'
    },
    {
        name: 'Weezing',
        image: '110.png',
        health: 160,
        number: '0110',
        size: 'l',
        type: 'poison'
    },
    {
        name: 'Rhyhorn',
        image: '111.png',
        health: 140,
        number: '0111',
        size: 'm',
        type: 'ground'
    },
    {
        name: 'Rhydon',
        image: '112.png',
        health: 180,
        number: '0112',
        size: 'l',
        type: 'ground'
    },
    {
        name: 'Chansey',
        image: '113.png',
        health: 250,
        number: '0113',
        size: 'xl',
        type: 'normal'
    },
    {
        name: 'Tangela',
        image: '114.png',
        health: 130,
        number: '0114',
        size: 'm',
        type: 'grass'
    },
    {
        name: 'Kangaskhan',
        image: '115.png',
        health: 210,
        number: '0115',
        size: 'xl',
        type: 'normal'
    },
    {
        name: 'Horsea',
        image: '116.png',
        health: 80,
        number: '0116',
        size: 's',
        type: 'water'
    },
    {
        name: 'Seadra',
        image: '117.png',
        health: 140,
        number: '0117',
        size: 'm',
        type: 'water'
    },
    {
        name: 'Goldeen',
        image: '118.png',
        health: 90,
        number: '0118',
        size: 's',
        type: 'water'
    },
    {
        name: 'Seaking',
        image: '119.png',
        health: 160,
        number: '0119',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Staryu',
        image: '120.png',
        health: 80,
        number: '0120',
        size: 's',
        type: 'water'
    },
    {
        name: 'Starmie',
        image: '121.png',
        health: 160,
        number: '0121',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Mr. Mime',
        image: '122.png',
        health: 160,
        number: '0122',
        size: 'l',
        type: 'psychic'
    },	
    {
        name: 'Scyther',
        image: '123.png',
        health: 160,
        number: '0123',
        size: 'l',
        type: 'bug'
    },
    {
        name: 'Jynx',
        image: '124.png',
        health: 180,
        number: '0124',
        size: 'l',
        type: 'ice'
    },
    {
        name: 'Electabuzz',
        image: '125.png',
        health: 180,
        number: '0125',
        size: 'l',
        type: 'electric'
    },
    {
        name: 'Magmar',
        image: '126.png',
        health: 180,
        number: '0126',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Pinsir',
        image: '127.png',
        health: 160,
        number: '0127',
        size: 'l',
        type: 'bug'
    },
    {
        name: 'Tauros',
        image: '128.png',
        health: 180,
        number: '0128',
        size: 'l',
        type: 'normal'
    },			
    {
        name: 'Magikarp',
        image: '129.png',
        health: 30,
        number: '0129',
        size: 's',
        type: 'water'
    },
    {
        name: 'Gyarados',
        image: '130.png',
        health: 120,
        number: '0130',
        size: 'm',
        type: 'dragon'
    },		
    {
        name: 'Lapras',
        image: '131.png',
        health: 220,
        number: '0131',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Ditto',
        image: '132.png',
        health: 80,
        number: '0132',
        size: 's',
        type: 'normal'
    },
    {
        name: 'Eevee',
        image: '133.png',
        health: 120,
        number: '0133',
        size: 'm',
        type: 'normal'
    },
    {
        name: 'Vaporeon',
        image: '134.png',
        health: 220,
        number: '0134',
        size: 'l',
        type: 'water'
    },
    {
        name: 'Jolteon',
        image: '135.png',
        health: 180,
        number: '0135',
        size: 'l',
        type: 'electric'
    },
    {
        name: 'Flareon',
        image: '136.png',
        health: 180,
        number: '0136',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Porygon',
        image: '137.png',
        health: 120,
        number: '0137',
        size: 'm',
        type: 'normal'
    },
    {
        name: 'Omanyte',
        image: '138.png',
        health: 160,
        number: '0138',
        size: 's',
        type: 'rock'
    },
    {
        name: 'Omastar',
        image: '139.png',
        health: 200,
        number: '0139',
        size: 'm',
        type: 'rock'
    },
    {
        name: 'Kabuto',
        image: '140.png',
        number: '0140',
        size: 's',
        type: 'rock'
    },
    {
        name: 'Kabutops',
        image: '141.png',
        health: 200,
        number: '0141',
        size: 'm',
        type: 'rock'
    },
    {
        name: 'Aerodactyl',
        image: '142.png',
        health: 200,
        number: '0142',
        size: 'l',
        type: 'rock'
    },
    {
        name: 'Snorlax',
        image: '143.png',
        health: 320,
        number: '0143',
        size: 'xl',
        type: 'normal'
    },
    {
        name: 'Articuno',
        image: '144.png',
        health: 280,
        number: '0144',
        size: 'l',
        type: 'ice'
    },
    {
        name: 'Zapdos',
        image: '145.png',
        health: 280,
        number: '0145',
        size: 'l',
        type: 'electric'
    },
    {
        name: 'Moltres',
        image: '146.png',
        health: 220,
        number: '0146',
        size: 'l',
        type: 'fire'
    },
    {
        name: 'Dratini',
        image: '147.png',
        health: 120,
        number: '0147',
        size: 's',
        type: 'dragon'
    },
    {
        name: 'Dragonair',
        image: '148.png',
        health: 160,
        number: '0148',
        size: 'm',
        type: 'dragon'
    },
    {
        name: 'Dragonite',
        image: '149.png',
        health: 180,
        number: '0149',
        size: 'l',
        type: 'dragon'
    },
    {
        name: 'Togepi',
        image: '175.png',
        health: 120,
        number: '0175',
        size: 's',
        type: 'fairy'
    },
    {
        name: 'Lugia',
        image: '249.png',
        health: 220,
        number: '0249',
        size: 'l',
        type: 'psychic'
    },
    {
        name: 'Ho-Oh',
        image: '250.png',
        health: 220,
        number: '0250',
        size: 'xl',
        type: 'fire'
    },
    {
        name: 'Eternatus',
        image: '890.png',
        health: 320,
        number: '0890',
        size: 'xl',
        type: 'dragon'
    },
];