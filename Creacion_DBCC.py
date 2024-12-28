import mysql.connector

# Conexión a MySQL en Clever Cloud
conexion = mysql.connector.connect(
    host="b3o8kpsldinxfvdwpjk4-mysql.services.clever-cloud.com",  # Proporcionado en el panel de Clever Cloud
    user="uqopg17f5ojxexlm",
    password="VUNx8Jct4sqxkX3UEZJL",
    database="b3o8kpsldinxfvdwpjk4"  # Nombre de la base de datos creada desde Clever Cloud
)

# Crear un cursor
cursor = conexion.cursor()

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

print("Tabla 'Medidas' creada exitosamente en la base de datos 'Base_Motor'.")


