"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPokemonData, BattlePokemon } from "../../api/queries";
import { typeEffectiveness, typeColors } from "../../api/queries";
import { motion, AnimatePresence } from "framer-motion";

export default function BattleIA() {
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [aiTeam, setAiTeam] = useState<BattlePokemon[]>([]);
  const [currentPlayerPokemon, setCurrentPlayerPokemon] =
    useState<BattlePokemon | null>(null);
  const [currentAiPokemon, setCurrentAiPokemon] =
    useState<BattlePokemon | null>(null);
  const [turn, setTurn] = useState<"player" | "ai">("player");
  const [playerHP, setPlayerHP] = useState<number>(100);
  const [aiHP, setAiHP] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showAttackAnimation, setShowAttackAnimation] = useState(false);

  const MAX_TEAM_SIZE = 6;

  const fetchPokemonWithMoves = async (
    pokemonName: string,
  ): Promise<BattlePokemon> => {
    const pokemonData = await getPokemonData(pokemonName);
    const randomMoves = pokemonData?.data?.moves
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
      .map((move) => ({
        name: move?.move?.name || "Tackle",
        type: move?.move?.type?.name || "normal",
      }));

    return {
      name: pokemonData?.data?.name || "",
      image: pokemonData?.data?.sprites?.front_default || "",
      moves: randomMoves,
      stats: {
        speed:
          pokemonData?.data?.stats?.find((stat) => stat.stat.name === "speed")
            ?.base_stat || 0,
        attack:
          pokemonData?.data?.stats?.find((stat) => stat.stat.name === "attack")
            ?.base_stat || 0,
        defense:
          pokemonData?.data?.stats?.find((stat) => stat.stat.name === "defense")
            ?.base_stat || 0,
      },
      id: pokemonData?.data?.id || 0,
      types: pokemonData?.data?.types?.map((type) => type?.type?.name) || [],
      hp: 100,
    };
  };

  const initializeAiTeam = async () => {
    const randomIds = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 151) + 1,
    ); // Random 6 Pokémon IDs between 1 and 151
    const aiTeamPromises = randomIds.map((id) =>
      fetchPokemonWithMoves(id.toString()),
    );
    const aiTeamData = await Promise.all(aiTeamPromises);

    setAiTeam(aiTeamData);
    setCurrentAiPokemon(aiTeamData[0]);
    setAiHP(100);
  };
  useEffect(() => {
    const fetchAiData = async () => {
      try {
        await initializeAiTeam();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching AI Pokémon data:", error);
        setLoading(false);
      }
    };

    fetchAiData();
  }, []);

  useEffect(() => {
    const storedTeam = localStorage.getItem("pokemonTeam");
    if (storedTeam) {
      const team = JSON.parse(storedTeam).map((pokemon) => ({
        ...pokemon,
        hp: 100,
        moves: pokemon.moves.map((move) => ({
          name: move.name,
          type: move.type,
        })),
      }));
      setPlayerTeam(team);
      setCurrentPlayerPokemon(team[0]);
      setPlayerHP(100);
    }
  }, []);

  const getEffectiveness = (attackType: string, defenderTypes: string[]) => {
    let effectiveness = 1;
    defenderTypes.forEach((defenderType) => {
      const typeEffect = typeEffectiveness[attackType];
      if (typeEffect && typeEffect[defenderType] !== undefined) {
        effectiveness *= typeEffect[defenderType];
      }
    });
    return effectiveness;
  };

  const calculateDamage = (move: { type: string }, defender: BattlePokemon) => {
    const basePower = 20;
    const effectiveness = getEffectiveness(move.type, defender.types);
    const baseDamage = basePower * effectiveness;
    return Math.floor(baseDamage);
  };

  const removeFaintedPokemon = (
    team: BattlePokemon[],
    setTeam: any,
    setCurrentPokemon: any,
    setHP: any,
  ) => {
    const updatedTeam = team.slice(1);
    setTeam(updatedTeam);
    if (updatedTeam.length > 0) {
      setCurrentPokemon(updatedTeam[0]);
      setHP(100);
    } else {
      setCurrentPokemon(null);
      setHP(0);
    }
  };

  const handlePlayerAttack = (moveIndex: number) => {
    if (!currentPlayerPokemon || !currentAiPokemon) return;

    const playerMove = currentPlayerPokemon.moves[moveIndex];
    const damage = calculateDamage(playerMove, currentAiPokemon);
    setAiHP(Math.max(aiHP - damage, 0));

    let hitMessage = "";
    let hitColor = "";

    if (damage >= 40) {
      hitMessage = "Very Effective Hit!";
      hitColor = "text-red-600";
    } else if (damage >= 20) {
      hitMessage = "Normal Hit";
      hitColor = "text-orange-500";
    } else if (damage > 0) {
      hitMessage = "Not Really Effective";
      hitColor = "text-yellow-500";
    } else {
      hitMessage = "Not Effective";
      hitColor = "text-gray-500";
    }

    setBattleLog((prev) => [
      ...prev,
      <span key={Math.random()}>
        <strong>YOU: </strong> {currentPlayerPokemon.name} used{" "}
        {playerMove.name} ({playerMove.type}) and dealt {damage} damage!{" "}
        <span className={hitColor}>{hitMessage}</span>
      </span>,
    ]);

    setShowAttackAnimation(true);
    setTimeout(() => {
      setShowAttackAnimation(false);
      if (aiHP - damage <= 0) {
        setBattleLog((prev) => [
          ...prev,
          <span key={Math.random()}>
            <strong>IA: </strong> {currentAiPokemon?.name} fainted!
          </span>,
        ]);
        removeFaintedPokemon(aiTeam, setAiTeam, setCurrentAiPokemon, setAiHP);
        localStorage.setItem("aiTeam", JSON.stringify(aiTeam));
      } else {
        setTurn("ai");
        handleAIAttack();
      }
    }, 1000);
  };
  const handleAIAttack = () => {
    if (!currentPlayerPokemon || !currentAiPokemon) return;

    const aiMove =
      currentAiPokemon.moves[
        Math.floor(Math.random() * currentAiPokemon.moves.length)
      ];
    const damage = calculateDamage(aiMove, currentPlayerPokemon);
    setPlayerHP(Math.max(playerHP - damage, 0));

    let hitMessage = "";
    let hitColor = "";

    if (damage >= 40) {
      hitMessage = "Very Effective Hit!";
      hitColor = "text-red-600";
    } else if (damage >= 20) {
      hitMessage = "Normal Hit";
      hitColor = "text-orange-500";
    } else if (damage > 0) {
      hitMessage = "Not Really Effective";
      hitColor = "text-yellow-500";
    } else {
      hitMessage = "Not Effective";
      hitColor = "text-gray-500";
    }

    setBattleLog((prev) => [
      ...prev,
      <span key={Math.random()}>
        <strong>IA: </strong> {currentAiPokemon.name} used {aiMove.name} (
        {aiMove.type}) and dealt {damage} damage!{" "}
        <span className={hitColor}>{hitMessage}</span>
      </span>,
    ]);

    setShowAttackAnimation(true);
    setTimeout(() => {
      setShowAttackAnimation(false);
      if (playerHP - damage <= 0) {
        setBattleLog((prev) => [
          ...prev,
          <span key={Math.random()}>
            <strong>YOU: </strong> {currentPlayerPokemon?.name} fainted!
          </span>,
        ]);
        removeFaintedPokemon(
          playerTeam,
          setPlayerTeam,
          setCurrentPlayerPokemon,
          setPlayerHP,
        );
        localStorage.setItem("pokemonTeam", JSON.stringify(playerTeam));
      } else {
        setTurn("player");
      }
    }, 1000);
  };
  const checkBattleOver = () => {
    if (playerTeam.length === 0) {
      return <h2 className="text-2xl font-bold text-red-600">AI Wins!</h2>;
    } else if (aiTeam.length === 0) {
      return (
        <h2 className="text-2xl font-bold text-green-600">Player Wins!</h2>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading battle...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        Pokémon Battle: Player vs AI
      </h1>

      {checkBattleOver() || (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{currentPlayerPokemon?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <img
                  src={currentPlayerPokemon?.image}
                  alt={currentPlayerPokemon?.name}
                  className="w-48 h-48 object-contain mb-4"
                />
                <Progress value={playerHP} className="w-full mb-2" />
                <p className="text-lg font-semibold">HP: {playerHP}/100</p>
              </div>
              {turn === "player" && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {currentPlayerPokemon?.moves.map((move, index) => (
                    <Button
                      key={index}
                      onClick={() => handlePlayerAttack(index)}
                      className={typeColors[move.type]}
                    >
                      {move.name} ({move.type})
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{currentAiPokemon?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <img
                  src={currentAiPokemon?.image}
                  alt={currentAiPokemon?.name}
                  className="w-48 h-48 object-contain mb-4"
                />
                <Progress value={aiHP} className="w-full mb-2" />
                <p className="text-lg font-semibold">HP: {aiHP}/100</p>
              </div>
              {turn === "ai" && (
                <div className="mt-4">
                  <Button onClick={handleAIAttack} className="w-full">
                    AI&apos;s Turn
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Battle Log</h3>
        <div className="bg-gray-100 p-4 rounded-lg h-40 overflow-y-auto">
          {battleLog
            .slice()
            .reverse()
            .map((log, index) => (
              <p key={index} className="mb-2">
                {log}
              </p>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {showAttackAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-yellow-400 text-black text-4xl font-bold p-4 rounded-full">
              Attack!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
