function getMultiplier(attackerType, opponentType) {
  const typeChart = {
      normal: { normal: 1, fighting: 2, flying: 1, poison: 1, ground: 1, rock: 0.5, bug: 1, ghost: 0, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
      fighting: { normal: 0.5, fighting: 1, flying: 0.5, poison: 0.5, ground: 1, rock: 2, bug: 0.5, ghost: 0, steel: 2, fire: 1, water: 1, grass: 1, electric: 1, psychic: 0.5, ice: 2, dragon: 1, dark: 2, fairy: 0.5 },
      flying: { normal: 1, fighting: 2, flying: 1, poison: 1, ground: 1, rock: 0.5, bug: 2, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 0.5, electric: 2, psychic: 1, ice: 2, dragon: 1, dark: 1, fairy: 1 },
      poison: { normal: 1, fighting: 1, flying: 1, poison: 0.5, ground: 2, rock: 1, bug: 1, ghost: 1, steel: 0, fire: 1, water: 1, grass: 0.5, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 2 },
      ground: { normal: 1, fighting: 1, flying: 0, poison: 2, ground: 1, rock: 2, bug: 0.5, ghost: 1, steel: 2, fire: 2, water: 1, grass: 0.5, electric: 2, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
      rock: { normal: 1, fighting: 0.5, flying: 2, poison: 1, ground: 0.5, rock: 1, bug: 2, ghost: 1, steel: 0.5, fire: 2, water: 1, grass: 1, electric: 1, psychic: 1, ice: 2, dragon: 1, dark: 1, fairy: 1 },
      bug: { normal: 1, fighting: 0.5, flying: 0.5, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 0.5, steel: 0.5, fire: 0.5, water: 1, grass: 2, electric: 1, psychic: 2, ice: 1, dragon: 1, dark: 2, fairy: 0.5 },
      ghost: { normal: 0, fighting: 0, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 2, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 0.5, fairy: 1 },
      steel: { normal: 0.5, fighting: 2, flying: 0.5, poison: 0, ground: 2, rock: 0.5, bug: 0.5, ghost: 1, steel: 0.5, fire: 2, water: 1, grass: 0.5, electric: 1, psychic: 0.5, ice: 0.5, dragon: 0.5, dark: 0.5, fairy: 0.5 },
      fire: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 0.5, bug: 2, ghost: 1, steel: 0.5, fire: 2, water: 0.5, grass: 2, electric: 1, psychic: 1, ice: 2, dragon: 1, dark: 1, fairy: 0.5 },
      water: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 2, bug: 1, ghost: 1, steel: 0.5, fire: 2, water: 0.5, grass: 2, electric: 1, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
      grass: { normal: 1, fighting: 1, flying: 2, poison: 2, ground: 0.5, rock: 0.5, bug: 0.5, ghost: 1, steel: 2, fire: 0.5, water: 0.5, grass: 0.5, electric: 1, psychic: 1, ice: 2, dragon: 1, dark: 1, fairy: 1 },
      electric: { normal: 1, fighting: 1, flying: 0.5, poison: 1, ground: 2, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 0.5, psychic: 1, ice: 1, dragon: 1, dark: 1, fairy: 1 },
      psychic: { normal: 1, fighting: 2, flying: 1, poison: 2, ground: 1, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 0.5, ice: 1, dragon: 1, dark: 0, fairy: 1 },
      ice: { normal: 1, fighting: 1, flying: 2, poison: 1, ground: 2, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 0.5, water: 0.5, grass: 2, electric: 1, psychic: 1, ice: 0.5, dragon: 2, dark: 1, fairy: 1 },
      dragon: { normal: 1, fighting: 1, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 1, steel: 0.5, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 2, dragon: 2, dark: 1, fairy: 0 },
      dark: { normal: 1, fighting: 0.5, flying: 1, poison: 1, ground: 1, rock: 1, bug: 1, ghost: 2, steel: 1, fire: 1, water: 1, grass: 1, electric: 1, psychic: 2, ice: 1, dragon: 1, dark: 0.5, fairy: 2 },
      fairy: { normal: 1, fighting: 2, flying: 1, poison: 0.5, ground: 1, rock: 1, bug: 1, ghost: 1, steel: 2, fire: 1, water: 1, grass: 1, electric: 1, psychic: 1, ice: 1, dragon: 0, dark: 0.5, fairy: 1 },
  };

  const damageMultiplier = typeChart[attackerType]?.[opponentType];

  let effectivenessString;

  if (damageMultiplier === 0) {
    effectivenessString = "No effect..";
  } else if (damageMultiplier === 0.5) {
    effectivenessString = "Not very effective..";
  } else if (damageMultiplier === 1) {
    effectivenessString = "Neutral effectiveness";
  } else if (damageMultiplier === 2) {
    effectivenessString = "Super effective!";
  } else {
    effectivenessString = "Unknown effectiveness"; // You can customize this based on your needs
  }

  return { damageMultiplier, effectivenessString };
}
