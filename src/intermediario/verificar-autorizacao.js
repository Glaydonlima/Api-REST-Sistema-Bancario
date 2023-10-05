const tokenAutentificacao = require("../data/token-autentificacao");
const db = require("../data/db");

module.exports = async function (req, res, next) {
  const bearer = req.headers.authorization;
  if (!bearer) {
    return res.json({
      message: "Token não foi passado",
    });
  }
  const token = bearer.split(" ")[1];
  const usuario = tokenAutentificacao.pegarUsuario(token);

  if (!usuario) {
    res.status(401).json({ mensagem: "Usuário não autenticado" });
  }

  req.usuario = usuario;
  return next();
};
