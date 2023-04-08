const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const InitializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running: https://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

InitializeDbServer();

// Get Movie Names
const convertToCamelCase = (movie) => ({
  movieName: movie.movie_name,
});

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT movie_name 
    From movie`;

  let moviesList = await db.all(moviesQuery);
  moviesList = moviesList.map(convertToCamelCase);
  response.send(moviesList);
});
