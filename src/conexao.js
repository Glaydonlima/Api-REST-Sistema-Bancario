require("dotenv").config();

module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  jwt: {
    pass: process.env.JWT_PASS,
    options: {
      expiresIn: "8h",
    },
  },
};
