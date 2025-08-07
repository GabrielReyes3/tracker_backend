const pool = require('../db');

exports.saveLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      'INSERT INTO locations (user_id, location) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)',
      [userId, lng, lat]
    );

    res.status(200).json({ message: 'Ubicación guardada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar ubicación' });
  }
};


exports.getLastLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.username,
        MAX(l.created_at) AS last_time,
        ST_X(l.location::geometry) AS lng,
        ST_Y(l.location::geometry) AS lat
      FROM users u
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.role = 'delivery'
      GROUP BY u.id, u.username, lat, lng
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener ubicaciones' });
  }
};
