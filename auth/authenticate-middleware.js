const jwt = require("jsonwebtoken");
const secret = require("../secret");
/* 
  complete the middleware code to check if the user is logged in
  before granting access to the next middleware/route handler
*/

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      you: "shall not pass!"
    });
    return;
  }

  try {
    const isValid = jwt.verify(token, secret());

    if (isValid) {
      next();
    } else {
      res.status(401).json({
        you: "shall not pass!"
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
};
