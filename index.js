var express = require("express");
var morgan = require("morgan");
const cors = require("cors");

var app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      tokens.method(req, res) === "POST" ? JSON.stringify(req.body) : "Empty",
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);
var notes = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
app.get("/api/persons", function (request, response) {
  return response.json(notes);
});

app.get("/api/persons/:id", (request, response) => {
  const target = notes.find((v) => v.id === request.params.id);
  console.log(target);

  if (target) {
    return response.json(target);
  } else {
    return response.status(404).send();
  }
});

app.get("/api/info", (request, response) => {
  return response
    .status(200)
    .send(
      `<p>The phonebook has ${
        notes.length
      } entries.</p><p>Time of request: ${new Date()}</p>`
    );
});

app.post("/api/persons", (request, response) => {
  const reqObject = request.body;
  let nameError = 0,
    numberError = 0;

  if (reqObject.name && reqObject.number) {
    if (
      notes.find(
        (v) => reqObject.name === v.name || reqObject.number === v.number
      )
    ) {
      return response.status(400).json([{ error: "Entry must be unique." }]);
    } else {
      const id = Math.floor(Math.random() * 99).toString();
      notes = notes.concat({
        ...reqObject,
        id,
      });
      return response.redirect(`/${id}`);
    }
  } else {
    if (!reqObject.name) {
      nameError = 1;
    }
    if (!reqObject.number) {
      numberError = 1;
    }
    return response.status(400).json({
      error: `${nameError ? "Invalid name." : ""} ${
        numberError ? "Invalid number." : ""
      }`,
    });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const pre = notes.length;
  const desNote = notes.find((v) => v.id === request.params.id);
  notes = notes.filter((v) => v.id !== request.params.id);
  if (pre === notes.length) {
    return response.status(500).send();
  } else {
    return response.status(200).json(desNote);
  }
});

const PORT = process.env.port || 3001;
app.listen(PORT, function () {
  console.log("App listening");
});
