<?php
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS Almacen";
$conn->query($sql);

// Seleccionar la base de datos
$conn->select_db("Almacen");

// SQL to create table
$sql = "CREATE TABLE IF NOT EXISTS productos (
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  color VARCHAR(30) NOT NULL,
  talla VARCHAR(30) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT(6) NOT NULL
)";
$conn->query($sql);

// Insertar productos de ropa (descomenta si necesitas insertarlos)
/*
$inserts = [
    "INSERT INTO productos (nombre, color, talla, precio, stock) VALUES ('Camiseta básica', 'Blanco', 'M', 19.99, 50)",
    "INSERT INTO productos (nombre, color, talla, precio, stock) VALUES ('Jeans slim fit', 'Azul', '32', 59.99, 30)",
    "INSERT INTO productos (nombre, color, talla, precio, stock) VALUES ('Sudadera con capucha', 'Negro', 'L', 39.99, 25)",
    "INSERT INTO productos (nombre, color, talla, precio, stock) VALUES ('Zapatos deportivos', 'Blanco', '42', 89.99, 15)",
    "INSERT INTO productos (nombre, color, talla, precio, stock) VALUES ('Chaqueta denim', 'Azul claro', 'S', 79.99, 10)"
];
foreach ($inserts as $sql) {
    $conn->query($sql);
}
*/

// Obtener productos para mostrar en la vista
$productos = [];
$sql = "SELECT id, nombre, color, talla, precio, stock FROM productos";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $productos[] = $row;
    }
}
$conn->close();

// Incluir la vista
include 'view.html';
?>