import socket
import mysql.connector

# Configuración de la base de datos
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="RonaldBasquet2324..",
    database="Base_motor"
)
cursor = db.cursor()

# Obtener el valor más reciente de la columna Ref_remota
cursor.execute("SELECT Ref_remota FROM Medidas ORDER BY id DESC LIMIT 1")
result = cursor.fetchone()

if result:
    referencia_remota = result[0]  # Obtener el valor de Ref_remota
    print(f"Referencia remota obtenida: {referencia_remota}")
else:
    print("No se encontró ningún valor en la columna Ref_remota.")
    referencia_remota = 0  # Valor por defecto si no se encuentra nada

# Configuración del cliente
micro_ip = "172.31.42.143"  # Cambia esto por la IP de tu ESP32
micro_port = 5002           # Puerto en el que el ESP32 está escuchando

# Crear un socket TCP
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((micro_ip, micro_port))

# Convertir el valor a cadena y enviarlo
data_to_send = f"{referencia_remota}\n"
client_socket.send(data_to_send.encode('utf-8'))

# Recibir la confirmación desde el ESP32
response = client_socket.recv(1024).decode('utf-8')
print(f"Respuesta desde ESP32: {response}")

# Cerrar la conexión
client_socket.close()
cursor.close()
db.close()
