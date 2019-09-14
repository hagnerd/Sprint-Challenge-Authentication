const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../database/dbConfig");
const secret = require("../secret");

function validateUserInput(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      message: "Must provide a username and password"
    });
  } else {
    next();
  }
}

router.post("/register", validateUserInput, async (req, res) => {
  const { username, password: raw } = req.body;
  const password = bcrypt.hashSync(raw, 12);

  try {
    const [id] = await db.from("users").insert({ username, password });

    const token = jwt.sign({ sub: id }, secret(), { expiresIn: "8h" });

    res.status(201).json({
      token
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
});

router.post("/login", validateUserInput, async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await db
      .select("*")
      .from("users")
      .where({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ sub: user.id }, secret(), { expiresIn: "8h" });

      res.status(200).json({
        token
      });
    } else {
      res.status(401).json({
        message: "Incorrect username & password combination"
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
});

module.exports = router;
