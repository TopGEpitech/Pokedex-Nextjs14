// app/pokemon/page.tsx
import axios from 'axios';
import Link from 'next/link';

export default async function PokemonList() {
    const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon');

    return (
        <div>
            <ul>
                {data.results.map((pokemon) => (
                    <li key={pokemon.name}>
                        <Link href={`/pokemon/${pokemon.name}`}>
                            {pokemon.name.toUpperCase()}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}