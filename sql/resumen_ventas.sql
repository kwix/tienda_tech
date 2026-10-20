CREATE OR REPLACE VIEW vista_resumen_ventas AS
SELECT 
    v.venta_id,
    c.nombre AS nombre_cliente,
    c.ciudad,
    p.nombre_producto,
    p.categoria,
    v.cantidad,
    v.total,
    v.fecha_venta
FROM ventas v
INNER JOIN clientes c ON v.cliente_id = c.cliente_id
INNER JOIN productos p ON v.producto_id = p.producto_id;