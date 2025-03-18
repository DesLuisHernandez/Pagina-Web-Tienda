document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('mainNavbar');
    const sections = document.querySelectorAll('.section');

    // Función para actualizar el color del navbar
    function updateNavbarBackground() {
        let currentSection = '';

        // Recorre cada sección para ver cuál está visible
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - navbar.clientHeight) {
                currentSection = section.id;
            }
        });

        // Cambia el color del navbar según la sección visible
        if (currentSection === 'inicio' || window.scrollY === 0) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; /* Fondo semi-transparente */
        } else if (currentSection === 'productos') {
            navbar.style.backgroundColor = 'rgba(248, 249, 250, 0.3)'; /* Color de la sección Productos */
        } else if (currentSection === 'ofertas') {
            navbar.style.backgroundColor = 'rgba(255, 193, 7, 0.3)'; /* Color de la sección Ofertas */
        } else if (currentSection === 'contacto') {
            navbar.style.backgroundColor = 'rgba(33, 37, 41, 0.3)'; /* Color de la sección Contacto */
        }
    }

    // Ejecuta la función al cargar la página
    updateNavbarBackground();

    // Ejecuta la función al hacer scroll
    window.addEventListener('scroll', updateNavbarBackground);
});

    // Título original de la página
    const originalTitle = document.title;

    // Mensajes para mostrar cuando la pestaña no está activa
    const messages = ["No esperes más...", "¡Regresa!", "¡Te extrañamos!", "¡No te vayas!"];

    // Índice para recorrer los mensajes
    let messageIndex = 0;

    // Función para cambiar el título
    function changeTitle() {
        if (document.hidden) {
            // Cambia el título cuando la pestaña no está activa
            document.title = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length; // Avanza al siguiente mensaje
        } else {
            // Restaura el título original cuando la pestaña está activa
            document.title = originalTitle;
        }
    }

    // Escucha el evento de cambio de visibilidad
    document.addEventListener("visibilitychange", changeTitle);

    // Opcional: Cambiar el título cada cierto tiempo cuando la pestaña no está activa
    setInterval(() => {
        if (document.hidden) {
            changeTitle();
        }
    }, 2000); // Cambia el título cada 2 segundos