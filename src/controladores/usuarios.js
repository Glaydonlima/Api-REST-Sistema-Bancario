const db = require("../data/db");
const bcrypt = require("bcrypt");
const tokenAutentificacao = require("../data/token-autentificacao");

const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Todos os campos devem ser preenchidos",
      });
    }
    if (await db.existeEmailUsuario(email)) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const usuario = await db.cadastrarUsuario({
      nome,
      email,
      senha: senhaCriptografada,
    });
    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await db.pegarSenhaUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(403).json({
        mensagem: "Email ou senha invalida",
      });
    }
    const senhaIgual = await bcrypt.compare(senha, usuario.senha);
    if (!senhaIgual) {
      return res.status(403).json({
        mensagem: "Email ou senha invalida",
      });
    }
    const token = tokenAutentificacao.criar({
      id: usuario.id,
      nome: usuario.nome,
    });

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
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
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
    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Todos os campos devem ser preenchidos",
      });
    }

    if (await db.existeEmailUsuario(email)) {
      return res.status(400).json({
        mensagem:
          "O e-mail informado já está sendo utilizado por outro usuário.",
      });
    }
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await db.alterarUsuario(nome, email, senhaCriptografada, id);
    return res.status(201).send();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  atualizarUsuario,
  procurarUsuario,
  loginUsuario,
  registrarUsuario,
};
