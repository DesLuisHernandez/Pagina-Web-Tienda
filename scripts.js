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

    // Subir imagen
    document.addEventListener('DOMContentLoaded', function () {
        const uploadInput = document.getElementById('uploadImage');
        const canvas = document.getElementById('tshirtCanvas');
        const ctx = canvas.getContext('2d');
    
        // Imagen de la camiseta
        const tshirtImage = new Image();
        tshirtImage.src = 'images/camisetaBlanca.png'; 
        tshirtImage.onload = function () {
            drawTshirt();
        };
    
        let uploadedImage = null;
        let imgX = 120, imgY = 160, imgWidth = 150, imgHeight = 150;
        let isDragging = false;
    
        function drawTshirt() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
            // Ajuste automático de la imagen de la camiseta
            const aspectRatio = tshirtImage.width / tshirtImage.height;
            let newWidth = canvas.width;
            let newHeight = newWidth / aspectRatio;
    
            if (newHeight > canvas.height) {
                newHeight = canvas.height;
                newWidth = newHeight * aspectRatio;
            }
    
            const offsetX = (canvas.width - newWidth) / 2;
            const offsetY = (canvas.height - newHeight) / 2;
    
            ctx.drawImage(tshirtImage, offsetX, offsetY, newWidth, newHeight);
    
            // Dibujar la imagen subida con efecto realista
            if (uploadedImage) {
                ctx.save(); // Guarda el estado del canvas
    
                ctx.globalAlpha = 0.85; // Le da un efecto de tinta en la tela
                ctx.globalCompositeOperation = "multiply"; // Fusión con la textura de la camiseta
                ctx.drawImage(uploadedImage, imgX, imgY, imgWidth, imgHeight);
    
                ctx.restore(); // Restaura el estado del canvas
            }
        }
    
        // Evento para subir una imagen
        uploadInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (!file) return;
    
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImage = new Image();
                uploadedImage.src = e.target.result;
    
                uploadedImage.onload = function () {
                    drawTshirt();
                };
            };
            reader.readAsDataURL(file);
        });
    
        // Eventos para mover la imagen con el mouse
        canvas.addEventListener('mousedown', function (e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
    
            if (mouseX >= imgX && mouseX <= imgX + imgWidth && mouseY >= imgY && mouseY <= imgY + imgHeight) {
                isDragging = true;
            }
        });
    
        canvas.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
    
            const rect = canvas.getBoundingClientRect();
            imgX = e.clientX - rect.left - imgWidth / 2;
            imgY = e.clientY - rect.top - imgHeight / 2;
            drawTshirt();
        });
    
        canvas.addEventListener('mouseup', function () {
            isDragging = false;
        });
    
        // Permitir zoom con la rueda del mouse
        canvas.addEventListener('wheel', function (e) {
            e.preventDefault();
            if (e.deltaY < 0) {
                imgWidth *= 1.1;
                imgHeight *= 1.1;
            } else {
                imgWidth *= 0.9;
                imgHeight *= 0.9;
            }
            drawTshirt();
        });
    });

// Agregar al carrito Camiseta Personalizada
//Esto solo funciona con la extencion live server de VSCode
document.addEventListener("DOMContentLoaded", function () {
    const cart = [];
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const misPedidosItems = document.getElementById('misPedidosItems');
    const misPedidosTotal = document.getElementById('misPedidosTotal');
    const addToCartButton = document.getElementById('addToCart');
    const priceDisplay = document.getElementById('priceDisplay');
    const canvas = document.getElementById('tshirtCanvas');
    const ctx = canvas.getContext('2d');

    const basePrice = 60000;

    // Cargar imagen de la camiseta asegurando que no haya restricciones
    const tshirtImage = new Image();
    tshirtImage.crossOrigin = "anonymous"; // Permite cargar imágenes sin restricciones
    tshirtImage.src = 'images/camisetaBlanca.png';

    tshirtImage.onload = function () {
        console.log("✅ Imagen de la camiseta cargada correctamente.");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tshirtImage, 0, 0, canvas.width, canvas.height);
    };

    if (!addToCartButton) {
        console.error("❌ ERROR: No se encontró el botón 'Agregar al Carrito'.");
        return;
    }

    // Agregar al carrito (como ya tienes)
    addToCartButton.addEventListener('click', function () {
        const imageURL = canvas.toDataURL("image/png");

        if (!imageURL || imageURL === "data:,") {
            alert("Primero personaliza tu camiseta antes de agregarla al carrito.");
            return;
        }

        cart.push({ image: imageURL, price: basePrice });
        updateCart();
    });

    // Función para actualizar el carrito
    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;

            const cartItem = document.createElement('li');
            cartItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            cartItem.innerHTML = `
                <img src="${item.image}" width="50" height="50" class="img-thumbnail">
                <span>$${item.price.toFixed(2)}</span>
                <button class="btn btn-danger btn-sm remove-item" data-index="${index}">&times;</button>
            `;

            cartItems.appendChild(cartItem);
        });

        cartTotal.textContent = `${total.toFixed(2)}$`;
        cartCount.textContent = cart.length;

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                cart.splice(index, 1);
                updateCart();
            });
        });
    }

    // Proceder al pago (guardar los productos en "Mis Pedidos")
    document.getElementById('procederAlPago').addEventListener('click', function () {
        // Guardar los productos en "Mis Pedidos"
        cart.forEach(item => {
            const pedidoItem = document.createElement('li');
            pedidoItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            pedidoItem.innerHTML = `
                <img src="${item.image}" width="50" height="50" class="img-thumbnail">
                <span>$${item.price.toFixed(2)}</span>
            `;
            misPedidosItems.appendChild(pedidoItem);
        });

        // Actualizar el total de Mis Pedidos
        let totalPedido = cart.reduce((acc, item) => acc + item.price, 0);
        misPedidosTotal.textContent = `${totalPedido.toFixed(2)}$`;

        // Vaciar el carrito
        cart.length = 0; // Esto borra el carrito
        updateCart(); // Actualiza la vista del carrito
    });

    // Mostrar el modal "Mis Pedidos" al hacer clic en el enlace
    document.getElementById('misPedidosLink').addEventListener('click', function () {
        // Mostrar el modal de Mis Pedidos
        const misPedidosModal = new bootstrap.Modal(document.getElementById('misPedidosModal'));
        misPedidosModal.show();
    });

    if (cartIcon) {
        cartIcon.addEventListener('click', function () {
            const modal = new bootstrap.Modal(document.getElementById('cartModal'));
            modal.show();
        });
    }
});
