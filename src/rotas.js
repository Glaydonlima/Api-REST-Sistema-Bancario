const express = require("express");
const { registrarUsuario, loginUsuario } = require("./controladores/usuarios");
const verificarAutorizacao = require("./intermediario/verificar-autorizacao");
const { listarCategorias } = require("./controladores/categorias");
const { cadastrarTransacao, modificarTransacao } = require("./controladores/transacoes");

const rotas = express();

rotas.post("/usuario", registrarUsuario);
rotas.post("/login", loginUsuario);

rotas.use(verificarAutorizacao);

rotas.get("/categoria", listarCategorias);

rotas.post("/transacao", cadastrarTransacao);
rotas.put("/transacao/:id", modificarTransacao);

module.exports = rotas;
