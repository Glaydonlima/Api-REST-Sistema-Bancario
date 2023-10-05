const db = require("../data/db");

const listarCategorias = async (req, res) => {
  const categorias = await db.listarCategorias();
  return res.status(200).json(categorias);
};

module.exports = {listarCategorias}