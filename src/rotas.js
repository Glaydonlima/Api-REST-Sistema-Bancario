const express = require("express");
const { registrarUsuario, loginUsuario, procurarUsuario, atualizarUsuario } = require("./controladores/usuarios");
const verificarAutorizacao = require("./intermediario/verificar-autorizacao");
const { listarCategorias } = require("./controladores/categorias");
const {
  cadastrarTransacao,
  modificarTransacao,
  deletarTransacao,
  extratoTransacao,
  filtrarTransacaoPorCategoria,
} = require("./controladores/transacoes");

const rotas = express();

rotas.post("/usuario", registrarUsuario);
rotas.post("/login", loginUsuario);

rotas.use(verificarAutorizacao);

rotas.get("/usuario", procurarUsuario);
rotas.put("/usuario", atualizarUsuario);


rotas.get("/categoria", listarCategorias);

rotas.post("/transacao", cadastrarTransacao);
rotas.get("/transacao/extrato", extratoTransacao);
rotas.get("/transacao/", filtrarTransacaoPorCategoria);
rotas.put("/transacao/:id", modificarTransacao);
rotas.delete("/transacao/:id", deletarTransacao);

module.exports = rotas;
