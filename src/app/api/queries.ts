import axios from "axios";

export const typeEffectiveness = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    grass: 2,
    ice: 2,
    bug: 2,
    steel: 2,
    fire: 0.5,
    water: 0.5,
    rock: 0.5,
    dragon: 0.5,
  },
  water: {
    fire: 2,
    ground: 2,
    rock: 2,
    water: 0.5,
    grass: 0.5,
    dragon: 0.5,
  },
  electric: {
    water: 2,
    flying: 2,
    electric: 0.5,
    ground: 0,
    grass: 0.5,
    dragon: 0.5,
  },
  grass: {
    water: 2,
    ground: 2,
    rock: 2,
    fire: 0.5,
    grass: 0.5,
    poison: 0.5,
    flying: 0.5,
    bug: 0.5,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    grass: 2,
    ground: 2,
    flying: 2,
    dragon: 2,
    fire: 0.5,
    water: 0.5,
    ice: 0.5,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    rock: 2,
    dark: 2,
    steel: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    fairy: 0.5,
    ghost: 0,
  },
  poison: {
    grass: 2,
    fairy: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
  },
  ground: {
    fire: 2,
    electric: 2,
    poison: 2,
    rock: 2,
    steel: 2,
    grass: 0.5,
    bug: 0.5,
    flying: 0,
  },
  flying: {
    grass: 2,
    fighting: 2,
    bug: 2,
    electric: 0.5,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: {
    grass: 2,
    psychic: 2,
    dark: 2,
    fire: 0.5,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    ghost: 0.5,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    flying: 2,
    bug: 2,
    fighting: 0.5,
    ground: 0.5,
    steel: 0.5,
  },
  ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: {
    ice: 2,
    rock: 2,
    fairy: 2,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    steel: 0.5,
  },
  fairy: {
    fighting: 2,
    dragon: 2,
    dark: 2,
    fire: 0.5,
    poison: 0.5,
    steel: 0.5,
  },
};
export interface TeamPokemon {
  name: string;
  image: string;
  moves: Array<{ name: string; type: string }>;
  id: number;
  types: string[];
}

export interface BattlePokemon {
  name: string;
  image: string;
  moves: Array<{ name: string; type: string }>; // Flatten the structure
  stats: { speed: number; attack: number; defense: number };
  id: number;
  hp: number;
}
export interface PokemonData {
  name: string;
  sprites: { front_default: string };
  types: Array<{ type: { name: string } }>;
  weight: number;
  height: number;
  abilities: Array<{ ability: { name: string }; is_hidden: boolean }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  moves: Array<{ move: { name: string; url: string } }>;
  id: number;
  flavorText: string;
  gender: string | null;
  isShiny: boolean;
}

export interface SpeciesData {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  evolution_chain?: { url: string };
}

interface TeamPokemon {
  name: string;
  image: string;
  moves: string[];
  id: number;
}
export const typeColors = {
  normal: "bg-gray-300",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-orange-600",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-green-300",
  rock: "bg-gray-600",
  ghost: "bg-indigo-700",
  dragon: "bg-purple-600",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

//
// const { data } = await axios.get<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
// const species = await axios.get<SpeciesData>(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`)

export const getPokemonData = async (name: string) => {
  try {
    const { data } = await axios.get<PokemonData>(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
    );
    const species = await axios.get<SpeciesData>(
      `https://pokeapi.co/api/v2/pokemon-species/${data.id}`,
    );

    const weight = data.weight / 10;
    const height = data.height / 10;
    const evolutionChainId = data.id;

    const flavorText =
      species.data.flavor_text_entries.find(
        (entry) => entry.language.name === "en",
      )?.flavor_text || "No description available.";

    return {
      data: {
        name: data.name,
        sprites: data.sprites,
        types: data.types,
        weight: weight,
        height: height,
        abilities: data.abilities,
        stats: data.stats,
        moves: data.moves,
        id: data.id,
        evolutionChainId: evolutionChainId,
        flavorText: flavorText,
      },
      error: false,
    };
  } catch (error) {
    return { error: true, message: error };
  }
};

export const fetchEvolutionChain = async (name: string) => {
  try {
    const { data } = await axios.get<PokemonData>(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
    );

    const species = await axios.get<SpeciesData>(
      `https://pokeapi.co/api/v2/pokemon-species/${data.id}`,
    );
    const weight = data.weight / 10;
    const height = data.height / 10;

    const evolutionChainUrl = species.data.evolution_chain?.url;
    const evolutionChainResponse = await axios.get(evolutionChainUrl);
    const evolutionChain = evolutionChainResponse.data;

    const getEvolutions = (chain) => {
      const evolutions = [];
      let current = chain;

      while (current) {
        const speciesUrl = current.species.url;
        const speciesId = speciesUrl.split("/").slice(-2, -1)[0]; // Extract Pokémon ID from the species URL

        evolutions.push({
          name: current.species.name,
          id: speciesId, // Store the Pokémon ID along with the name
        });

        if (current.evolves_to.length > 0) {
          current = current.evolves_to[0];
        } else {
          current = null;
        }
      }
      return evolutions;
    };

    const evolutions = getEvolutions(evolutionChain.chain);

    const flavorText =
      species.data.flavor_text_entries.find(
        (entry) => entry.language.name === "en",
      )?.flavor_text || "No description available.";

    return {
      data: {
        name: data.name,
        sprites: data.sprites,
        types: data.types,
        weight: weight,
        height: height,
        abilities: data.abilities,
        stats: data.stats,
        moves: data.moves,
        id: data.id,
        evolutions: evolutions,
        flavorText: flavorText,
      },
      error: false,
    };
  } catch (error) {
    return { error: true, message: error.message };
  }
};
