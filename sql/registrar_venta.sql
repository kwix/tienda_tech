ALTER TABLE ventas
  MODIFY venta_id INT NOT NULL AUTO_INCREMENT;

DROP PROCEDURE IF EXISTS sp_registrar_venta_app;

DELIMITER //

CREATE PROCEDURE sp_registrar_venta_app(
    IN p_cliente_id INT,
    IN p_producto_id INT,
    IN p_cantidad INT
)
BEGIN
    DECLARE v_precio DECIMAL(10,2) DEFAULT NULL;
    DECLARE v_total DECIMAL(10,2);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_precio = NULL;

    IF p_cantidad < 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La cantidad debe ser al menos 1';
    END IF;

    SELECT precio INTO v_precio
    FROM productos
    WHERE producto_id = p_producto_id;

    IF v_precio IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Producto no encontrado';
    END IF;

    SET v_total = v_precio * p_cantidad;

    INSERT INTO ventas (cliente_id, producto_id, cantidad, total, fecha_venta)
    VALUES (p_cliente_id, p_producto_id, p_cantidad, v_total, NOW());
END //

DELIMITER ;
