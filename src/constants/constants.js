export const Role = {
    VISITOR: "visitante",
    CLIENT: "cliente",
    EMPLOYEE: "empleado",
    ADMIN: "administrador",
};

export const Status = {
    INACTIVE: "inactivo",
    UNVERIFIED: "sin verificar",
    REGISTERED: "registrado",
    DELETED: "borrado",
};

/* 
Si por alguna razon estas viendo esto, soy nacho, me debo de haber olvidado de borrar esto antes de pushear algun cambio, estoy usando esto para resumir algo de objetos 2 porque es lo que tenia a mano

Definicion framework:
    Un framework es una aplicación “semi-completa”, “reusable”, que puede ser especializada para producir aplicaciones a medida… un conjunto de clases concretas y abstractas, relacionadas (por herencia, conocimiento, envío de mensajes) para proveer una arquitectura reusable que implementa una familia de aplicaciones (relacionadas)...
Definicion caja blanca:
    ● La instanciación hereda y completa el loop de control agregando código
        ○ Ejercitando un hotspot con herencia
        ○ Modificando código fuente del framework
        ○ Es posible que requiera agregar métodos a clases del framework
    ● Demanda conocimiento del código del framework ⇒ es una Caja Blanca
    ● Loop de control suele ser Template Method
Definicion caja negra:
    ● La instancia se obtiene mediante composición y completa el loop de control agregando código
        ○ Usando interfaces o clases proporcionadas por el framework
        ○ Configurando componentes sin modificar el código fuente
        ○ No requiere herencia directa ni cambios en el framework
    ● Demanda conocimiento limitado del código del framework ⇒ es una Caja Negra
    ● Loop de control suele ser manejado por un contenedor o configurador (no Template Method)
Definicion hotspot y frozenspot:
    FrozenSpot: aspecto del framework que afecta a todas las instanciaciones y que no se puede modificar (marca indeleble)
        ● Comportamiento invariable en un framework orientado a objetos
    HotSpot: estructura en el código que permite modificar el comportamiento del framework, para instanciar y para extender. Hooks Methods
        ● Punto de variabilidad de un framework orientado a objetos
Definicion inversion de control:
    Es un principio de diseño donde el control del flujo de un programa se delega a un componente externo, como un framework, en lugar de que el código de la aplicación lo gestione directamente. Esto significa que el framework asume la responsabilidad de crear, configurar y gestionar los objetos (o componentes) y sus interacciones, en lugar de que el desarrollador lo haga manualmente.
Agregar funcionalidad:

*/