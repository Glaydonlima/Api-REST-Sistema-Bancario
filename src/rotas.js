const express = require("express");
const { registrarUsuario, loginUsuario } = require("./controladores/usuarios");
const verificarAutorizacao = require("./intermediario/verificar-autorizacao");
const { listarCategorias } = require("./controladores/categorias");

const rotas = express();

rotas.post("/usuario", registrarUsuario);
rotas.post("/login", loginUsuario);

rotas.use(verificarAutorizacao);

rotas.get('/categoria', listarCategorias)

module.exports = rotas;
