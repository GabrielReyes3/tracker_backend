const pool = require('../db');
const bcrypt = require('bcrypt');

const createUser = async (username, password, role) => {
  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
    [username, hashed, role]
  );
  console.log(`Usuario creado: ${username} (${role})`);
  process.exit();
};

//createUser('admin1', 'adminpass', 'admin');
createUser('delivery1', 'deliverypass', 'delivery');
