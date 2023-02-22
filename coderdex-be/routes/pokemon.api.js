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

module.exports = router;
