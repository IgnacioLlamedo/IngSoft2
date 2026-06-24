<h1 align="center"> Proyecto - CEF </h1>

&nbsp;
### Manual de uso Mercado Pago:

Para poder usar mercado pago se debe tener un URL https. Para ello podemos crearlo directamente desde VS Code:

1. Accedemos a la pestaña puertos, la cual es un tab en la misma pestaña que está la terminal.
   > Si no tenemos la pestaña, abrimos la paleta de comandos con <kbd> Ctrl + Shift + P </kbd> e introducimos el comando <kbd> Ports: Focus on Ports View </kbd>.

2. Creamos un puerto pulsando "Reenviar puerto/Agregar puerto", se quedará esperando que ingresemos un puerto. Se debe ingresar estrictamente el puerto "8080".

3. En el archivo ".env", agregamos/sobrescribimos la variable "link", asignándole como valor el link creado por VS Code en el puerto "8080" en el punto anterior. <strong>Al link que le asignen, borrenle la barrita ("/") final.</strong>

4. Por último, revisen si tienen la línea de código <kbd> link:process.env.LINK </kbd> en el export del archivo "config.js", en caso de no tenerla, cópienla y peguenla.


&nbsp;
### Credenciales de testing, para usarlos inicien sesión en Mercado Pago con la siguiente cuenta:
- Cuenta: TESTUSER2796893861660132777
- Contraseña: 3RlzT2mo9M
- Código de verificación: 866242

⚠️ Si se queda sin plata avísenle a Facu ⚠️

<br><br>

> [!IMPORTANT]
> Comentario destacado: Gracias Faku por salvarme de mi sufrimiento











<br><br><br><br>
<h1 align="center"> Demo 1 - 46 Puntos </h1>

![Badge en desarrollo](https://img.shields.io/badge/Status-Terminada-green) ![Badge nota](https://img.shields.io/badge/Nota_PREDEMO_obtenida-Regular-purple) ![Badge nota](https://img.shields.io/badge/Nota_DEMO_obtenida-Regular-purple)

&nbsp;
### Temas a cubrir:
- Navegación básica.
- Registrarse/Iniciar sesión/Cerrar sesión como cliente, utilizando doble factor y pudiendo recuperar contraseña.
- Poder modificar sus datos y contraseña.
- Seleccionar y reservar actividades con cupo disponible. Sin lista de espera. Con la clase cargada desde DB.
- Pagar con mercado pago.

&nbsp;
### Temas opcionales:
- Crear clase.
- Lista de espera.

&nbsp;
### Historias que incluye:
- Registrar usuario - [ 3 Pts. ]
- Iniciar sesión - [ 6 Pts. ]
- Cerrar sesión - [ 2 Pts. ]
- Autenticar usuario por doble factor - [ 3 Pts. ]
- Ver datos personales - [  2 Pts. ]
- Modificar usuario del sistema - [ 2 Pts. ]
- Modificar contraseña - [ 4 Pts. ]
- Recuperar contraseña - [ 5 Pts. ]
- Inscribirse a mensualidad - [ 7 Pts. ]
- Anotarse a clase única - [ 7 Pts. ]
- Pagar con mercado pago - [ 8 Pts. ]

&nbsp;
### Historias opcionales que incluye:
- Crear sala - [ 1 Pts. ]
- Modificar sala - [ 1 Pts. ]
- Eliminar sala - [ 1 Pts. ]
- Registrar profesor - [ 2 Pts. ]
- Modificar profesor - [ 2 Pts. ]
- Eliminar profesor - [ 2 Pts. ]
- Crear clase - [ 3 Pts. ]
- Modificar una clase - [ 3 Pts. ]
- Eliminar clase - [ 2 Pts. ]
- Desplegar opciones de clase - [ 1 Pts. ]
- Salir de lista de espera - [ 2 Pts. ]
- Aceptar cupo liberado - [ 4 Pts. ]
- Rechazar cupo liberado - [ 4 Pts. ]


<br><br><br><br>
<h1 align="center"> Demo 2 - 90 Puntos </h1>

![Badge en desarrollo](https://img.shields.io/badge/Status-En_Progreso-orange) ![Badge nota](https://img.shields.io/badge/Nota_PREDEMO_obtenida-Indef-purple) ![Badge nota](https://img.shields.io/badge/Nota_DEMO_obtenida-Indef-purple)

&nbsp;
### Temas a cubrir:
- Creación/Modificación/Eliminación de clases. Pueden ponerse inactivas y deberán avisar a todos sus inscriptos.
- Tabla de clases dinámica en cuanto a salas.
- Profesores ligados a actividad, estados de inactividad ligados a fechas y motivos.
- Estadísticas de administrador.
- Asistencias con QR o DNI.
- Avisos de cupos liberados, junto con su aceptación y rechazo.
- Pagar resto de lo señado.
- Cancelaciones, créditos y devoluciones.
- Renovar mensualidades de 30 días cada una.
- Crear funcionalidad de recordatorio de renovación.
- Historiales del usuario.
- Registrar empleados.

&nbsp;
### Historias que incluye:
- Crear clase - [ 3 Pts. ]
- Modificar clase - [ 3 Pts. ]
- Eliminar clase - [ 2 Pts. ]
- Desplegar opciones de clase - [ 1 Pts. ]
- Registrar asistencia DNI - [ 5 Pts. ]
- Registrar asistencia QR - [ 10 Pts. ]
- Escanear QR asistencia - [ 5 Pts. ]
- Salir de lista de espera - [ 2 Pts. ]
- Aceptar cupo liberado - [ 4 Pts. ]
- Rechazar cupo liberado - [ 4 Pts. ]
- Cancelar reserva - [ 3 Pts. ]
- Cancelar mensualidad - [ 4 Pts. ]
- Pagar resto - [ 2 Pts. ]
- Renovar mensualidad - [ 4 Pts. ]
- Configurar notificación de recordatorio de pago - [ 2 Pts. ]
- Ver historial de pagos - [ 7 Pts. ]
- Ver mis presentes - [ 3 Pts. ]
- Registrar profesor - [ 2 Pts. ]
- Modificar profesor - [ 2 Pts. ]
- Eliminar profesor - [ 2 Pts. ]
- Registrar empleado - [ 3 Pts. ]
- Modificar empleado - [ 2 Pts. ]
- Eliminar empleado - [ 2 Pts. ]
- Ver usuarios registrados - [ 3 Pts. ]
- Ver facturación por período - [ 3 Pts. ]
- Ver facturación por tipo de clase - [ 4 Pts. ]
- Ver cancelaciones por clase - [ 3 Pts. ]
- Aumentar precio cuota - [ ? Pts. ]
  
### Faltan crear las HU nuevas que surgieron en la Demo 1


