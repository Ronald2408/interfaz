import socket
import mysql.connector
from datetime import datetime
import pytz

# Configuración de la base de datos
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="RonaldBasquet2324..",
    database="Base_Motor"
)
cursor = db.cursor()

# Crear tabla si no existe
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
db.commit()  # Confirmar la creación de la tabla

# Configuración del servidor TCP
server_ip = "0.0.0.0"
server_port = 5000
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((server_ip, server_port))
server_socket.listen(1)

print(f"Servidor de escritura escuchando en {server_ip}:{server_port}")

while True:
    client_socket, client_address = server_socket.accept()
    print(f"Conexión desde {client_address}")
    data = client_socket.recv(1024).decode()
    print(f"Datos recibidos: {data}")  # Imprimir los datos recibidos para verificar el formato

    # Verificar si los datos recibidos son una solicitud HTTP
    if data.startswith("GET") or data.startswith("POST"):
        print("Solicitud HTTP recibida, no se puede procesar como datos de ESP32.")
        client_socket.close()
        continue

    try:
        # Dividir los datos recibidos en las variables respectivas
        velocidad_value, referencia_value, senal_control_value, kp_value, ki_value, kd_value, kn_value, ks_value, selector_value = map(float, data.strip().split(','))

        # Ajustar la señal de control a rango de 0 a 5 si está en 0-255
        senal_control_value = senal_control_value * (5.0 / 255.0)
        print(f"Valores procesados: Velocidad={velocidad_value}, Referencia={referencia_value}, Señal Control={senal_control_value}, Selector={selector_value}")

        # Obtener la hora actual en UTC
        now_utc = datetime.now(pytz.utc)

        # Inserción de los datos en la base de datos
        cursor.execute("""
            INSERT INTO Medidas (Tiempo, Velocidad, Referencia, Senal_control, Kp, Ki, Kd, Kn, Ks, Selector)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (now_utc, velocidad_value, referencia_value, senal_control_value, kp_value, ki_value, kd_value, kn_value, ks_value, selector_value))

        db.commit()
        print(f"Datos almacenados en la base de datos correctamente.")

    except ValueError as e:
        print(f"Error al procesar los datos recibidos: {e}")

    except mysql.connector.Error as db_err:
        print(f"Error de MySQL: {db_err}")
        db.rollback()  # Rollback si ocurre un error al insertar en la base de datos

    finally:
        client_socket.close()

