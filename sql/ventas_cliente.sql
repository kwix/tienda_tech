DELIMITER //
CREATE PROCEDURE sp_consultar_ventas_cliente(IN p_cliente_id INT)
BEGIN
    SELECT * FROM vista_resumen_ventas
    WHERE nombre_cliente = (SELECT nombre FROM clientes WHERE cliente_id = p_cliente_id)
    ORDER BY fecha_venta DESC;
END //
DELIMITER ;