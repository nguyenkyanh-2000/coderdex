const express = require("express");
const fs = require("fs");
const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    // input validation
    const allowedFilter = ["search", "type"];
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    //Filter out uneccesary queries
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) delete filterQuery[key];
    });
    // processing logic
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    let result = [];

    if (Object.keys(filterQuery).length) {
      result = pokemons;
      if (filterQuery.search) {
        if (isNaN(filterQuery.search)) {
          result = result.filter((pokemon) =>
            pokemon.name.includes(filterQuery.search)
          );
        } else {
          result = result.filter((pokemon) => pokemon.id == filterQuery.search);
        }
      }
      if (filterQuery.type) {
        result = result.filter((pokemon) =>
          pokemon.types.includes(filterQuery.type)
        );
      }
    } else result = pokemons;

    result = [...new Set(result)];

    let offset = limit * (page - 1);
    result = result.slice(offset, offset + limit);
    // send response
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  let { id } = req.params;
  try {
    // input validation
    if (isNaN(id) || id == 0) {
      const exception = new Error(`PokemonID is not a number`);
      exception.status = 401;
      throw exception;
    } else id = parseInt(id);
    // processing logic
    let db = fs.readFileSync("db.json", "utf-8");
    const { pokemons } = JSON.parse(db);
    let currentPokemon_id;
    let currentPokemon = pokemons.find((pokemon, index) => {
      currentPokemon_id = index;
      return pokemon.id == id;
    });
    const result = {
      previousPokemon:
        currentPokemon_id === 0
          ? pokemons[pokemons.length - 1]
          : pokemons[currentPokemon_id - 1],
      pokemon: currentPokemon,
      nextPokemon:
        currentPokemon_id === pokemons.length - 1
          ? pokemons[0]
          : pokemons[currentPokemon_id + 1],
    };
    // send response
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    let { id } = req.params;
    //input validation
    if (isNaN(id) || id == 0) {
      console.log(id);
      const exception = new Error(`PokemonID is not a number`);
      exception.status = 401;
      throw exception;
    }
    id = parseInt(id);
    //processing logic
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    const targetIndex = pokemons.find((pokemon) => pokemon.id === id).id;
    if (!targetIndex) {
      const exception = new Error(`Pokemon not found`);
      exception.status = 404;
      throw exception;
    }
    db.pokemons = pokemons.filter((pokemon) => pokemon.id !== targetIndex);
    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    //send response
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    let db = fs.readFileSync("db.json", "utf-8");
    const { pokemons } = JSON.parse(db);
    const pokemonTypes = [
      "bug",
      "dragon",
      "fairy",
      "fire",
      "ghost",
      "ground",
      "normal",
      "psychic",
      "steel",
      "dark",
      "electric",
      "fighting",
      "flying",
      "grass",
      "ice",
      "poison",
      "rock",
      "water",
    ];
    // input validation
    let { name, id, url, types } = req.body;

    if (!name || !id || !url || !types) {
      const exception = new Error(`Missing body info`);
      exception.status = 401;
      throw exception;
    }

    // filter out nulls
    types = types.filter((type) => type);

    if (isNaN(id)) {
      const exception = new Error(`Wrong ID type!`);
      exception.status = 401;
      throw exception;
    }
    // No more case sensitive inputs
    name = name.toLowerCase();
    types = types.map((type) => type.toLowerCase());

    if (pokemons.find((pokemon) => pokemon.id == id || pokemon.name == name)) {
      const exception = new Error(`Duplicate Pokemon`);
      exception.status = 401;
      throw exception;
    }

    if (types.length > 2) {
      const exception = new Error(`Too many types`);
      exception.status = 401;
      throw exception;
    }

    if (!types.some((type) => pokemonTypes.includes(type))) {
      const exception = new Error(`Wrong types`);
      exception.status = 401;
      throw exception;
    }

    // processing
    id = parseInt(id);
    const newPokemon = { id, name, types, url };
    db = JSON.parse(db);
    pokemons.push(newPokemon);
    db.pokemons = pokemons;
    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    // send response
    res.status(200).send("ok");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
