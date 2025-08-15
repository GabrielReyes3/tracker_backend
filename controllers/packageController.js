const pool = require('../db');

exports.getAllPackages = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username AS delivery_name
      FROM packages p
      LEFT JOIN users u ON p.delivery_id = u.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener paquetes' });
  }
};

exports.getMyPackages = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT * FROM packages
      WHERE delivery_id = $1
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener tus paquetes' });
  }
};

exports.createPackage = async (req, res) => {
  const { address, deliveryId } = req.body;
  const io = req.app.get('io');

  try {
    const result = await pool.query(
      `INSERT INTO packages (address, delivery_id) VALUES ($1, $2) RETURNING *`,
      [address, deliveryId || null]
    );

    const pkg = result.rows[0];

    // Emitir evento de paquete nuevo al delivery asignado
    if (deliveryId) {
      io.emit(`package-update-${deliveryId}`, pkg);
    }

    res.json(pkg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creando paquete' });
  }
};

exports.assignPackage = async (req, res) => {
  const { packageId, deliveryId } = req.body;
  const io = req.app.get('io');

  try {
    await pool.query(`
      UPDATE packages
      SET delivery_id = $1
      WHERE id = $2
    `, [deliveryId, packageId]);

    // Emitir evento de paquete asignado al delivery correspondiente
    io.emit(`package-update-${deliveryId}`, { id: packageId, delivery_id: deliveryId });

    res.status(200).json({ message: 'Paquete asignado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al asignar paquete' });
  }
};

exports.updateStatus = async (req, res) => {
  const userId = req.user.id;
  const { packageId, status } = req.body;

  const validStatuses = ['En transito', 'Entregado', 'Regresado'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    // Verificar que el paquete le pertenece al delivery
    const result = await pool.query(`
      SELECT * FROM packages
      WHERE id = $1 AND delivery_id = $2
    `, [packageId, userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'No autorizado para modificar este paquete' });
    }

    await pool.query(`
      UPDATE packages
      SET status = $1
      WHERE id = $2
    `, [status, packageId]);

    res.status(200).json({ message: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};
