const db = require("../data/db");
const bcrypt = require("bcrypt");
const tokenAutentificacao = require("../data/token-autentificacao");
const {
  verificarCamposPreenchidos,
  verificarEmailExistente,
  criptografarSenha,
  verificarSenha,
  criarToken,
} = require("../utils/utils-usuarios");

const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    verificarCamposPreenchidos(req, res);
    await verificarEmailExistente(email);

    const senhaCriptografada = await criptografarSenha(senha);
    const usuario = await db.cadastrarUsuario({
      nome,
      email,
      senha: senhaCriptografada,
    });
    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await db.pegarSenhaUsuarioPorEmail(email);
    if (!usuario) {
      throw new Error("Email ou senha inválida");
    }
    await verificarSenha(senha, usuario.senha);
    const token = criarToken(usuario);

    return res.status(201).json([
      {
        id: usuario.id,
        nome: usuario.nome,
        email,
      },
      {
        token,
      },
    ]);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

const procurarUsuario = async (req, res) => {
  try {
    const { id } = req.usuario;
    const usuario = (await db.pegarUsuarioPorId(id)).rows;
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.usuario;
    const { nome, email, senha } = req.body;
    verificarCamposPreenchidos(req, res);
    await verificarEmailExistente(email);

    const senhaCriptografada = await criptografarSenha(senha);

    await db.alterarUsuario(nome, email, senhaCriptografada, id);
    return res.status(201).send();
  }  catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

module.exports = {
  atualizarUsuario,
  procurarUsuario,
  loginUsuario,
  registrarUsuario,
};
