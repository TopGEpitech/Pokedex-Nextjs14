"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getPokemonData,
  fetchEvolutionChain,
  PokemonData,
  TeamPokemon,
} from "../../api/queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PokemonPage({ params }: { params: { name: string } }) {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [evolutionData, setEvolutionData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pokemonResponse = await getPokemonData(params.name);
        if (pokemonResponse.error) {
          throw new Error(pokemonResponse.message);
        }

        setPokemonData(pokemonResponse.data);

        const evolutionResponse = await fetchEvolutionChain(params.name);
        if (evolutionResponse.error) {
          throw new Error(evolutionResponse.message);
        }

        setEvolutionData(evolutionResponse.data.evolutions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.name]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>E F{params.name}</p>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <div className="flex justify-between">
        <Link href="/">
          <Button variant="outline" className="text-sm sm:text-base">
            Back
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {pokemonData.name.toUpperCase()}
          </CardTitle>
          <CardDescription className="text-center">
            {pokemonData.flavorText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Image
              src={pokemonData.sprites.front_default}
              alt={pokemonData.name}
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Types:</h3>
                <div className="flex gap-2">
                  {pokemonData.types.map((type) => (
                    <Badge key={type.type.name} variant="secondary">
                      {type.type.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p>
                  <strong>Weight:</strong> {pokemonData.weight} kg
                </p>
                <p>
                  <strong>Height:</strong> {pokemonData.height} m
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Abilities:</h3>
                <ul className="list-disc list-inside">
                  {pokemonData.abilities.map((ability) => (
                    <li key={ability.ability.name}>
                      {ability.ability.name}{" "}
                      {ability.is_hidden && (
                        <Badge variant="outline">(Hidden)</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-4">Stats:</h3>
            <div className="space-y-2">
              {pokemonData.stats.map((stat) => (
                <div key={stat.stat.name} className="flex items-center gap-2">
                  <div className="w-24 text-right font-medium">
                    {stat.stat.name.toUpperCase()}:
                  </div>
                  <Progress
                    value={stat.base_stat}
                    max={255}
                    className="w-full"
                  />
                  <div className="w-8 text-right">{stat.base_stat}</div>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-semibold mb-4">Moves:</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <ul className="grid grid-cols-2 gap-2">
                {pokemonData.moves.map((move) => (
                  <li key={move.move.name} className="text-sm">
                    {move.move.name}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </CardContent>
        <h3 className="text-lg font-semibold mb-4">Evolutions:</h3>
        <CardFooter className="flex justify-center">
          <span className="flex items-center">
            {evolutionData.length > 0
              ? evolutionData.map((evolution) => (
                  <span key={evolution.id} className="flex items-center">
                    <a className="flex flex-col items-center text-blue-500 hover:underline">
                      <Link href={`/pokemon/${evolution.name}`} passHref>
                        <Image
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`} // Use the actual Pokémon id from the API
                          alt={evolution.name}
                          width={150}
                          height={150}
                          className="rounded-lg shadow-lg"
                        />
                        {evolution.name}
                      </Link>
                    </a>
                  </span>
                ))
              : "No evolutions available"}
          </span>
        </CardFooter>{" "}
      </Card>
    </div>
  );
}
