import mysql.connector

# Conexión a MySQL
conexion = mysql.connector.connect(
    host="localhost",  # Cambia esto si tu servidor MySQL no está en la misma máquina
    user="root",
    password="RonaldBasquet2324.."
)

# Crear un cursor
cursor = conexion.cursor()

# Crear la base de datos
cursor.execute("CREATE DATABASE IF NOT EXISTS Base_Motor")

# Seleccionar la base de datos
cursor.execute("USE Base_Motor")

# Crear la tabla con las columnas especificadas
cursor.execute("""
    CREATE TABLE IF NOT EXISTS Medidas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Tiempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        Velocidad FLOAT,
        Referencia FLOAT,
        Senal_control FLOAT,
        Kp FLOAT,
        Ki FLOAT,
        Kd FLOAT,
        Kn FLOAT,
        Ks FLOAT,
        Ref_remota FLOAT,
        Selector INT
    )
""")

# Confirmar cambios y cerrar la conexión
conexion.commit()
cursor.close()
conexion.close()

print("Base de datos y tabla creadas exitosamente.")



