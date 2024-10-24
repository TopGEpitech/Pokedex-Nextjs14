"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPokemonData,
  PokemonData,
  TeamPokemon,
  typeColors,
} from "../../api/queries";
import Link from "next/link";
import { PlusCircle, Minus } from "lucide-react";
import axios from "axios";

const getRandomMoves = async (
  moves: Array<{ move: { name: string } }>,
  count: number,
) => {
  const randomMoves = [];

  const shuffledMoves = moves.sort(() => 0.5 - Math.random()).slice(0, count);

  for (const moveData of shuffledMoves) {
    const moveName = moveData.move.name;

    const moveDetails = await axios.get(
      `https://pokeapi.co/api/v2/move/${moveName}`,
    );
    console.log("MOVE DETAILS", moveDetails);
    const moveType = moveDetails.data.type.name;

    randomMoves.push({
      name: moveName,
      type: moveType, // Store move type
      power: Math.floor(Math.random() * 50) + 50, // Random power for simplicity
    });
  }

  return randomMoves;
};

export default function EnhancedPokemonTeamBuilder() {
  const [pokemonList, setPokemonList] = useState<PokemonData[]>([]);
  const [team, setTeam] = useState<TeamPokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedTeam = localStorage.getItem("pokemonTeam");
    if (storedTeam) {
      console.log("STORED TEAM", storedTeam);
      setTeam(JSON.parse(storedTeam));
    }

    const fetchPokemonList = async () => {
      try {
        const promises = Array.from({ length: 151 }, (_, index) =>
          getPokemonData((index + 1).toString()),
        );

        const pokemonData = await Promise.all(promises);
        const validPokemonData = pokemonData
          .filter((pokemon) => !pokemon.error)
          .map((pokemon) => pokemon.data);

        setPokemonList(validPokemonData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        setLoading(false);
      }
    };

    fetchPokemonList();
  }, []);

  const getRandomMoves = async (
    moves: Array<{ move: { name: string } }>,
    count: number,
  ): Promise<Array<{ name: string; type: string }>> => {
    const randomMoves = [];

    const shuffledMoves = moves.sort(() => 0.5 - Math.random()).slice(0, count);

    for (const moveData of shuffledMoves) {
      const moveName = moveData.move.name;

      // Faire une requête pour récupérer les détails du mouvement
      const moveDetails = await axios.get(
        `https://pokeapi.co/api/v2/move/${moveName}`,
      );
      const moveType = moveDetails.data.type.name;

      randomMoves.push({
        name: moveName,
        type: moveType, // Stocker le type de l'attaque
      });
    }

    return randomMoves;
  };

  const addToTeam = async (pokemon: PokemonData) => {
    if (team.length >= 6) {
      alert("Your team is full. Maximum of 6 Pokémon.");
      return;
    }

    const randomMoves = await getRandomMoves(pokemon.moves, 4);

    const newPokemon: TeamPokemon = {
      name: pokemon.name,
      image: pokemon.sprites.front_default,
      moves: randomMoves, // Contient le nom et le type de l'attaque
      id: pokemon.id,
      types: pokemon.types.map((type) => type.type.name),
    };

    const updatedTeam = [...team, newPokemon];
    setTeam(updatedTeam);
    localStorage.setItem("pokemonTeam", JSON.stringify(updatedTeam));
  };
  const removeFromTeam = (id: number) => {
    const updatedTeam = team.filter((p) => p.id !== id);
    setTeam(updatedTeam);
    localStorage.setItem("pokemonTeam", JSON.stringify(updatedTeam));
  };

  console.log(team);
  return (
    <div className="min-h-screen bg-red-600 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="secondary" className="text-blue-600 font-bold">
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-center text-blue-500">
            Your Team
          </h1>
          <div className="w-16"></div> {/* Spacer for alignment */}
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.clear();
              setTeam([]);
              alert("All Pokémon have been removed from your team!");
            }}
          >
            Clear All Pokémon
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {team.map((pokemon) => (
            <Card
              key={pokemon.id}
              className={`overflow-hidden rounded-3xl ${typeColors[pokemon.types[0]]} border-4 border-white`}
            >
              <CardContent className="p-4 flex flex-col items-center">
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain mb-2"
                />
                <h2 className="text-2xl font-bold capitalize mb-2">
                  {pokemon.name}
                </h2>
                <div className="flex space-x-2 mb-4">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-30"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Moves:</h3>
                  <ul className="list-disc list-inside">
                    {pokemon.moves.map((move) => (
                      <li key={move.name}>{move.name}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => removeFromTeam(pokemon.id)}
                  variant="destructive"
                  className="rounded-full w-8 h-8 p-0 mt-4"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Available Pokémon
        </h2>
        <ScrollArea className="h-[400px] w-full rounded-md bg-white/10 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading
              ? Array(12)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="overflow-hidden rounded-xl">
                      <CardContent className="p-4">
                        <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                      </CardContent>
                    </Card>
                  ))
              : pokemonList.map((pokemon) => (
                  <Card
                    key={pokemon.id}
                    className={`overflow-hidden rounded-xl ${typeColors[pokemon.types[0]?.type?.name] || "bg-gray-200"} hover:shadow-lg transition-shadow duration-300`}
                  >
                    <CardContent className="p-2 flex flex-col items-center">
                      <img
                        src={pokemon.sprites.front_default}
                        alt={pokemon.name}
                        className="w-20 h-20 object-contain mb-2"
                      />
                      <h3 className="text-sm font-semibold capitalize mb-1 text-center">
                        {pokemon.name}
                      </h3>
                      <div className="flex gap-1 mb-2">
                        {pokemon.types.map((type) => (
                          <div
                            className="overflow-hidden p-0.5 rounded-xl bg-white/30 hover:bg-white/50"
                            key={type.type.name}
                          >
                            {type.type.name}
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => addToTeam(pokemon)}
                        className="rounded-full w-8 h-8 p-0 bg-white/30 hover:bg-white/50"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-8 text-center">
        <Link href="/fight/ia">
          <Button
            variant="secondary"
            size="lg"
            className="text-blue-600 font-bold"
          >
            Start Fight
          </Button>
        </Link>
      </div>
    </div>
  );
}
