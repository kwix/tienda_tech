require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function esIdValido(id) {
  return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function camposProductoValidos({ nombre_producto, categoria, precio }) {
  return typeof nombre_producto === 'string'
    && nombre_producto.trim() !== ''
    && typeof categoria === 'string'
    && categoria.trim() !== ''
    && precio !== undefined
    && precio !== null
    && precio !== ''
    && Number.isFinite(Number(precio))
    && Number(precio) >= 0;
}

function camposClienteValidos({ nombre, email, ciudad }) {
  return [nombre, email, ciudad].every(value => typeof value === 'string' && value.trim() !== '');
}

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Error verificando la conexión a MySQL:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 1. OBTENER TODOS LOS PRODUCTOS (READ)
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos ORDER BY producto_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error consultando productos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. CREAR UN PRODUCTO (CREATE)
app.post('/api/productos', async (req, res) => {
  const { nombre_producto, categoria, precio } = req.body;
  if (!camposProductoValidos(req.body)) {
    return res.status(400).json({ error: 'Ingresa nombre, categoría y un precio válido (mayor o igual a 0)' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO productos (nombre_producto, categoria, precio) VALUES (?, ?, ?)',
      [nombre_producto.trim(), categoria.trim(), Number(precio)]
    );
    res.status(201).json({ id: result.insertId, nombre_producto: nombre_producto.trim(), categoria: categoria.trim(), precio: Number(precio) });
  } catch (err) {
    console.error('Error creando producto:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. ACTUALIZAR UN PRODUCTO (UPDATE)
app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_producto, categoria, precio } = req.body;
  if (!esIdValido(id) || !camposProductoValidos(req.body)) {
    return res.status(400).json({ error: 'ID o datos del producto no válidos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE productos SET nombre_producto = ?, categoria = ?, precio = ? WHERE producto_id = ?',
      [nombre_producto.trim(), categoria.trim(), Number(precio), id]
    );
    if (result.affectedRows === 0) {
      const [rows] = await db.query('SELECT producto_id FROM productos WHERE producto_id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (err) {
    console.error('Error actualizando producto:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. ELIMINAR UN PRODUCTO (DELETE)
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  if (!esIdValido(id)) return res.status(400).json({ error: 'ID de producto no válido' });

  try {
    const [result] = await db.query('DELETE FROM productos WHERE producto_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (err) {
    console.error('Error eliminando producto:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. CRUD DE CLIENTES
// ==========================================
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY cliente_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error consultando clientes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { nombre, email, ciudad } = req.body;
  if (!camposClienteValidos(req.body)) {
    return res.status(400).json({ error: 'Nombre, email y ciudad son obligatorios' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO clientes (nombre, email, ciudad, fecha_registro) VALUES (?, ?, ?, CURDATE())',
      [nombre.trim(), email.trim(), ciudad.trim()]
    );
    res.status(201).json({ id: result.insertId, nombre: nombre.trim(), email: email.trim(), ciudad: ciudad.trim() });
  } catch (err) {
    console.error('Error creando cliente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, ciudad } = req.body;
  if (!esIdValido(id) || !camposClienteValidos(req.body)) {
    return res.status(400).json({ error: 'ID o datos del cliente no válidos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE clientes SET nombre = ?, email = ?, ciudad = ? WHERE cliente_id = ?',
      [nombre.trim(), email.trim(), ciudad.trim(), id]
    );
    if (result.affectedRows === 0) {
      const [rows] = await db.query('SELECT cliente_id FROM clientes WHERE cliente_id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado con éxito' });
  } catch (err) {
    console.error('Error actualizando cliente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  if (!esIdValido(req.params.id)) return res.status(400).json({ error: 'ID de cliente no válido' });
  try {
    const [result] = await db.query('DELETE FROM clientes WHERE cliente_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error('Error eliminando cliente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. REGISTRO DE VENTAS (USANDO STORED PROCEDURE)
// ==========================================
app.post('/api/ventas', async (req, res) => {
  const { cliente_id, producto_id, cantidad } = req.body;
  if (!esIdValido(cliente_id) || !esIdValido(producto_id) || !Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) {
    return res.status(400).json({ error: 'Selecciona cliente, producto y una cantidad válida' });
  }
  try {
    await db.query('CALL sp_registrar_venta_app(?, ?, ?)', [cliente_id, producto_id, cantidad]);
    res.status(201).json({ message: 'Venta registrada con éxito mediante Stored Procedure' });
  } catch (err) {
    console.error('Error registrando venta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CONSULTAS, VISTAS Y PROCEDIMIENTOS ALMACENADOS
// ==========================================

// Consulta desde una VISTA
app.get('/api/consultas/vista-ventas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vista_resumen_ventas LIMIT 50');
    res.json(rows);
  } catch (err) {
    console.error('Error consultando la vista de ventas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ejecución de STORED PROCEDURE con Parámetro (Filtrar ventas por cliente)
app.get('/api/consultas/ventas-cliente/:id', async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_consultar_ventas_cliente(?)', [req.params.id]);
    res.json(rows[0]); // MySQL devuelve los resultados de los SP en la posición [0]
  } catch (err) {
    console.error('Error ejecutando consulta de ventas por cliente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});