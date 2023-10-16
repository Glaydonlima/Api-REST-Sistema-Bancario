const bcrypt = require("bcrypt");
const db = require("../data/db");
const tokenAutentificacao = require("../data/token-autentificacao");
const verificarCamposPreenchidos = (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    throw new Error("Todos os campos devem ser preenchidos");
  }
};

const verificarEmailExistente = async (email) => {
  if (await db.existeEmailUsuario(email)) {
    throw new Error("Já existe usuário cadastrado com o e-mail informado.");
  }
};

const criptografarSenha = async (senha) => {
  return await bcrypt.hash(senha, 10);
};

const verificarSenha = async (senha, hash, res) => {
  const senhaIgual = await bcrypt.compare(senha, hash);
  if (!senhaIgual) {
    throw new Error("Email ou senha inválida");
  }
};

const criarToken = (usuario) => {
  return tokenAutentificacao.criar({
    id: usuario.id,
    nome: usuario.nome,
  });
};

module.exports = {
  verificarCamposPreenchidos,
  verificarEmailExistente,
  criptografarSenha,
  verificarSenha,
  criarToken,
};
