"use client";

import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Pokemon {
  name: string;
  image: string;
  id: number;
}

export default function Home() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then(async (response) => {
        const pokemonData = await Promise.all(
          response.data.results.map(async (pokemon: { url: string }) => {
            const res = await axios.get(pokemon.url);
            return {
              name: res.data.name,
              image: res.data.sprites.front_default,
              id: res.data.id,
            };
          }),
        );
        setPokemonList(pokemonData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Pokémon:", error);
        setIsLoading(false);
      });
  }, []);

  const filteredPokemonList = pokemonList.filter((pokemon) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      pokemon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      pokemon.id.toString() === lowerCaseSearchTerm
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <Image
          src="/pokedex.png"
          alt="Pokedex"
          width={300}
          height={300}
          className="mr-4"
        />
      </div>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by Name or N°"
          className="border border-gray-300 rounded-md p-2 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex justify-between">
        <Link href="/fight">
          <Image
            src={"/pokemon.png"}
            alt="Pokemonfight"
            width={160}
            height={160}
            className="mr-4 background-white border-2 border-black rounded-full bg-white"
          />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(12)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="h-[150px] w-full" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-[100px] mb-2" />
                  <Skeleton className="h-4 w-[80px]" />
                </CardContent>
              </Card>
            ))
        ) : filteredPokemonList.length > 0 ? (
          filteredPokemonList.map((pokemon, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-0">
                <Image
                  src={pokemon.image}
                  alt={pokemon.name}
                  width={150}
                  height={150}
                  className="w-full h-[150px] object-contain bg-secondary"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold capitalize mb-2">
                  {pokemon.name}
                </CardTitle>
              </CardContent>
              <CardFooter>
                <Link href={`/pokemon/${pokemon.name}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center w-full col-span-4">
            <p>{searchTerm} NOT FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
