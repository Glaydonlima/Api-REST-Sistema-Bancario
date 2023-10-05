const jwt = require("jsonwebtoken");
const conexao = require("../conexao");

module.exports = {
  criar(usuario) {
    return jwt.sign(usuario, conexao.jwt.pass, conexao.jwt.options);
  },

  pegarUsuario(token) {
    try {
      return jwt.verify(token, conexao.jwt.pass);
    } catch (error) {
      return;
    }
  },
};
