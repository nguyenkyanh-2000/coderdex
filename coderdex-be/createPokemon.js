const fs = require("fs");
const csv = require("csvtojson");
require("dotenv").config();

const createPokemon = async () => {
  let newData = await csv().fromFile("./data/pokemon.csv");
  let db = JSON.parse(fs.readFileSync("db.json"));
  newData = newData.map((pokemon, index) => {
    return {
      id: index + 1,
      name: pokemon.Name,
      types: pokemon.Type2
        ? [pokemon.Type1.toLowerCase(), pokemon.Type2.toLowerCase()]
        : [pokemon.Type1.toLowerCase()],
      url: fs.existsSync(`./data/images/${pokemon.Name}.png`)
        ? `${process.env.REACT_APP_BACKEND_API}${pokemon.Name}.png`
        : `${process.env.REACT_APP_BACKEND_API}${pokemon.Name}.jpg`,
    };
  });

  db.pokemons = newData;
  fs.writeFileSync("db.json", JSON.stringify(db));
};

createPokemon();
