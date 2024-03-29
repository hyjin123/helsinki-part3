const express = require("express");
const app = express();

require("dotenv").config();

const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
// creating custom morgan logger message for http requests

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(
  morgan(`:method :url :status :res[content-length] - :response-time ms :body`)
);

app.get("/info", (request, response) => {
  Person.find({}).then((people) => {
    response.send(`<p>This phonebook has info for ${people.length} people</p>
    <p>${new Date()}</p>
    `);
  });
});

// Fetching everyone from the phonebook
app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

// Fetching individual person's information
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });

  // const id = Number(request.params.id);

  // const person = persons.find((person) => person.id === id);

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end();
  // }
});

// Deleting a person from the phonebook
app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  console.log(id);

  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));

  // persons = persons.filter((person) => person.id !== id);

  // response.status(204).end();
});

// Adding a person to the phonebook
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: "name is missing" });
  }

  const person = new Person({ name: body.name, number: body.number });

  person
    .save()
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));

  // const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;

  // const person = request.body;

  // person.id = maxId + 1;

  // // if the name or number is missing, send an error message
  // if (person.name && person.number) {
  //   const duplicate = persons.find((n) => n.name === person.name);

  //   if (duplicate) {
  //     response.status(404).send("name already exists in the phonebook");
  //   } else {
  //     persons = persons.concat(person);
  //     response.json(person);
  //   }
  // } else {
  //   response.status(404).send("you did not specify a name or a number");
  // }
});

// Updating a person to the phonebook
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const id = request.params.id;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));

  // if (body.name === undefined) {
  //   return response.status(400).json({ error: "name is missing" });
  // }

  // const person = new Person({ name: body.name, number: body.number });

  // person.save().then((result) => {
  //   response.json(result);
  // });
});

// These two middleware must come at the end of the code after all HTTP request handlers
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error("this is the error message", error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
