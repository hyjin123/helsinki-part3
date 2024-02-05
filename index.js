const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(morgan("tiny"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  response.send(`<p>This phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log(id);

  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);

  console.log(persons);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;

  const person = request.body;

  person.id = maxId + 1;

  console.log(person);

  // if the name or number is missing, send an error message
  if (person.name && person.number) {
    const duplicate = persons.find((n) => n.name === person.name);

    if (duplicate) {
      response.status(404).send("name already exists in the phonebook");
    } else {
      persons = persons.concat(person);
      response.json(person);
    }
  } else {
    response.status(404).send("you did not specify a name or a number");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
