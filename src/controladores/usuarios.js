const db = require("../data/db");
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
    let statusCode;
    let errorMessage = error.message;
    switch (error.message) {
      case "Todos os campos devem ser preenchidos.":
        statusCode = 400;
        break;
      case "Já existe usuário cadastrado com o e-mail informado.":
        statusCode = 400;
        break;
      default:
        statusCode = 500;
        errorMessage = "Erro interno do servidor";
        break;
    }
    return res.status(statusCode).json({ mensagem: errorMessage });
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

    return res.status(200).json([
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
    let statusCode;
    let errorMessage = error.message;
    switch (error.message) {
      case "Email ou senha inválida":
        statusCode = 400;
        break;
      default:
        statusCode = 500;
        errorMessage = "Erro interno do servidor";
        break;
    }
    return res.status(statusCode).json({ mensagem: errorMessage });
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
  } catch (error) {
    let statusCode;
    let errorMessage;
    switch (error.message) {
      case "Todos os campos devem ser preenchidos.":
      case "Já existe usuário cadastrado com o e-mail informado.":
        statusCode = 400;
        errorMessage = error.message;
        break;
      default:
        statusCode = 500;
        errorMessage = "Erro interno do servidor";
        break;
    }
    return res.status(statusCode).json({ mensagem: errorMessage });
  }
};

module.exports = {
  atualizarUsuario,
  procurarUsuario,
  loginUsuario,
  registrarUsuario,
};
