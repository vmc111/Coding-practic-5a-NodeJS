const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

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

// Post API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  //   console.log(request.body);
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}')`;

  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Get with movieId

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //   console.log(movieId);

  const getMovieQuery = `
    Select * 
    FROM movie
    WHERE 
        movie_id = ${movieId};`;

  const requiredPlayer = await db.get(getMovieQuery);
  const camelCase = (obj) => ({
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  });
  response.send(camelCase(requiredPlayer));
});

// PUT METHOD

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateQuery = `
  UPDATE movie 
  SET 
    director_id = ${directorId}, 
    movie_name = '${movieName}', 
    lead_actor = '${leadActor}' 
    WHERE 
        movie_id = ${movieId};`;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

// DELETE METHOD

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const DeleteQuery = `
    DELETE 
        FROM movie 
    WHERE 
        movie_id = ${movieId};`;

  await db.run(DeleteQuery);
  response.send("Movie Removed");
});

// GET MOVIES BY DIRECTOR_ID

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const directorQuery = `
    SELECT 
        movie_name AS movieName
    FROM movie 
    WHERE 
        director_id = ${directorId}`;

  let movies = await db.all(directorQuery);
  response.send(movies);
});

// Get Directors names

app.get("/directors/", async (request, response) => {
  const directorDetailsQuery = `
    SELECT 
    director_id AS directorId, 
    director_name AS directorName
    FROM director;`;

  let directorsList = await db.all(directorDetailsQuery);
  response.send(directorsList);
});

module.exports = app;
