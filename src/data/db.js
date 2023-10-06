const { Pool } = require("pg");

const { db } = require("../conexao");

// client -> script/app
const pool = new Pool(db);

module.exports = {
  async cadastrarUsuario({ nome, email, senha }) {
    const sql =
      "insert into usuarios(nome, email, senha) values ($1, $2, $3) returning id, nome, email";
    const valores = [nome, email, senha];
    const resposta = await pool.query(sql, valores);
    return resposta.rows[0];
  },

  async existeEmailUsuario(email) {
    const sql = "select count(*) from usuarios where email = $1;";
    const values = [email];
    const { rows } = await pool.query(sql, values);
    return rows[0].count != 0;
  },

  async listarUsuarios() {
    const sql = "select id, nome, email from usuarios";
    const { rows } = await pool.query(sql);
    return rows;
  },

  async pegarUsuarioPorId(id) {
    const sql = `select
          id,
          nome,
          email
      from usuarios
      where id = $1`;
    const { rows, rowCount } = await pool.query(sql, [id]);
    return { rows: rows[0], rowCount };
  },

  async pegarSenhaUsuarioPorEmail(email, senha) {
    const sql = `select id, nome , senha from usuarios where email=$1`;
    const { rows } = await pool.query(sql, [email]);
    return rows[0];
  },

  async listarCategorias() {
    const sql = "select * from categorias";
    const { rows } = await pool.query(sql);
    return rows;
  },

  async pegarCategoriaPorId(categoria_id) {
    const sql = "select descricao from categorias where id = $1";
    const { rows } = await pool.query(sql, [categoria_id]);
    return rows[0];
  },

  async cadastrarTransacao(
    descricao,
    valor,
    data,
    categoria_id,
    usuario_id,
    tipo
  ) {
    const sql =
      "insert into transacoes(descricao, valor, data, categoria_id, usuario_id, tipo)values ($1, $2, $3, $4, $5, $6) returning *";
    const { rows } = await pool.query(sql, [
      descricao,
      valor,
      data,
      categoria_id,
      usuario_id,
      tipo,
    ]);
    return rows[0];
  },
};
