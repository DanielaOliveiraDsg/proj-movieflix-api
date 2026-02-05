import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json" with { type: "json" };
const port = 3000;
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});
// filter record - filtering movies by genre
app.get("/movies/:genre", async (req, res) => {
    try {
        const genreType = req.params.genre;
        // 1- check if genre exists
        const genreExists = await prisma.genre.findFirst({
            where: {
                name: {
                    equals: genreType,
                    mode: "insensitive",
                },
            },
        });
        if (!genreExists) {
            return res.status(404).send({
                message: `Genre '${genreType}' not found`,
            });
        }
        // 2- fetch movies by genre
        const moviesByGenre = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genreType,
                        mode: "insensitive",
                    },
                },
            },
        });
        // 3- Genre exists, but no movies found in the category
        // findMany always returns an array by design. So testing its length we can find out if there is any movies at all
        if (moviesByGenre.length === 0) {
            return res.status(404).send({
                message: `No movies found for genre '${genreType}'`,
            });
        }
        // 4- success = returns the array of movies
        res.status(200).send(moviesByGenre);
    }
    catch (error) {
        res.status(500).send({ message: "Fail to filter movies by genre" });
    }
});
//create a new record
app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        // check if movie title already exists
        const movieExist = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },
            },
        });
        if (movieExist) {
            return res.status(409).send({ message: "Movie already registered" });
        }
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Fail to register movie" });
    }
    res.status(201).send();
});
//updating a record
app.put("/movies/:id", async (req, res) => {
    //get the register id to be updated
    const id = Number(req.params.id);
    //get record data to be updated and update in Prisma
    const data = { ...req.body };
    data.release_date = data.release_date
        ? new Date(data.release_date)
        : undefined;
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            return res.status(404).send({ message: "Movie record doesn't exist" });
        }
        await prisma.movie.update({
            where: { id },
            data,
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Fail to update movie" });
    }
    res.status(201).send();
});
// deleting a record
app.delete("/movies/:id", async (req, res) => {
    //get the register id to be updated
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            return res.status(404).send({ message: "Movie record doesn't exist" });
        }
        await prisma.movie.delete({
            where: { id },
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Fail to delete movie" });
    }
    res.status(201).send();
});
app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map