const db = require("../data/db");

const validarCampos = (campos, mensagem) => {
  for (let campo of campos) {
    if (!campo) {
      throw new Error(mensagem);
    }
  }
};

const validarTipo = (tipo) => {
  const mensagem = "Campo tipo deve ser informado corretamente";
  if (tipo !== "entrada" && tipo !== "saida") {
    throw new Error(mensagem);
  }
};

const validarValor = (valor) => {
  const mensagem = "Campo valor deve ser informado corretamente";
  if (isNaN(valor) || valor < 0) {
    throw new Error(mensagem);
  }
};

const validarId = (id) => {
  const mensagem = "O ID deve ser um número positivo";
  if (isNaN(id) || parseInt(id) <= 0) {
    throw new Error(mensagem);
  }
};

const validarCategoria = async (categoria_id) => {
  const categorias = await db.listarCategorias();
  const existeCategoria = categorias.find((categoria) => categoria.id == categoria_id);
  if (!existeCategoria) {
    throw new Error("A categoria informada não existe");
  }
};

const mensagemError = () => {
  throw new Error("Erro interno do servidor");
};

const formataString = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

module.exports = {
  validarId,
  formataString,
  mensagemError,
  validarCampos,
  validarCategoria,
  validarTipo,
  validarValor,
};
