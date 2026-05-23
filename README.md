<h1 align="center"> Demo 1 - 46 Puntos </h1>

![Badge en desarrollo](https://img.shields.io/badge/Status-In_Progress-orange) ![Badge nota](https://img.shields.io/badge/Nota_PREDEMO_obtenida-Indef-purple) ![Badge nota](https://img.shields.io/badge/Nota_DEMO_obtenida-Indef-purple)

&nbsp;
### Credenciales para testing:

- Cuenta Comprador: TESTUSER2796893861660132777    (Avisenme si se queda sin plata)
- Contraseña: 3RlzT2mo9M
- Código de verificación: 866242

&nbsp;
### Detalles a la hora de testear:

- Pueden testear la creación de pagos si van a la terminal, puertos -> <img width="178" height="42" alt="image" src="https://github.com/user-attachments/assets/497d6a31-4aa6-4cdf-bb0d-30022e771773" /> -> añaden un puerto cualquiera -> modifican el PORT dentro de el archivo .env para que coincida con el nuevo puerto y entran a la forwarded address que les da el puerto.
- Gracias Faku por salvarme de mi sufrimiento


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

&nbsp;
### A agregar:
- El Front en teoría se agrega en la carpeta src/public -> index.html va a ser la homepage
- Crear un nuevo html para el registro, inicio de sesión y recuperación de contraseña.
- Otros aspectos del código y/o dudas:
    * daos -> Data Access Objects, modelos de objetos?
    * controllers -> Donde voy a ir agregando servicios
