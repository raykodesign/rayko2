document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SEGURIDAD Y PROTECCIÓN
    // ==========================================
    
    // Bloquear Click Derecho
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Bloquear Teclas de Inspección (F12, Ctrl+Shift+I, etc.)
    document.onkeydown = function(e) {
        if(e.keyCode == 123) { // F12
            return false;
        }
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { // Ctrl+Shift+I
            return false;
        }
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { // Ctrl+Shift+C
            return false;
        }
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { // Ctrl+Shift+J
            return false;
        }
        if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { // Ctrl+U
            return false;
        }
    }


    // ==========================================
    // 2. CONFIGURACIÓN Y VARIABLES
    // ==========================================
    const mainTitle = document.getElementById('main-title');
    const items = document.querySelectorAll('.gallery-item');
    const body = document.body;
    const overlay = document.getElementById('modal-overlay');
    const closeArea = document.querySelector('.close-area-click');
    const modalCards = document.querySelectorAll('.modal-card');
    
    // --- LISTA DE REPRODUCCIÓN ---
    const playlist = [
        { title: "Beéle", artist: "Top Diesel", file: "music/Beele  top diesel.mp3" },
    ];
    let currentTrack = 0;


    // ==========================================
    // 3. AUTOPLAY INTELIGENTE
    // ==========================================
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('p-play');
    const nextBtn = document.getElementById('p-next');
    const tName = document.getElementById('t-name');
    const tArtist = document.getElementById('t-artist');

    // Cargar la primera canción
    loadTrack(0);

    // Intentar reproducir automáticamente
    let playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Autoplay exitoso
            updatePlayIcon(true);
        })
        .catch(error => {
            // Autoplay bloqueado por navegador. Esperar al primer click del usuario.
            document.addEventListener('click', function unlockAudio() {
                audio.play();
                updatePlayIcon(true);
                // Remover el evento para que no se dispare siempre
                document.removeEventListener('click', unlockAudio);
            }, { once: true });
        });
    }


    // ==========================================
    // 4. INTERACCIÓN VISUAL (HOVER)
    // ==========================================
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const color = item.getAttribute('data-color');
            
            // Cambiar color y brillo del título principal
            mainTitle.style.setProperty('--dynamic-color', color);
            mainTitle.style.setProperty('--dynamic-glow', color);
            
            // Activar modo hover (difumina el título)
            body.classList.add('hover-mode');
        });

        item.addEventListener('mouseleave', () => {
            body.classList.remove('hover-mode');
            
            // Retrasar el reseteo del color para suavidad
            setTimeout(() => {
                if(!body.classList.contains('hover-mode')) {
                    mainTitle.style.setProperty('--dynamic-color', '#fff');
                }
            }, 300);
        });

        // Click para abrir el popup
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const color = item.getAttribute('data-color');
            openModal(targetId, color);
        });
    });


    // ==========================================
    // 5. GESTIÓN DE MODALES
    // ==========================================
    function openModal(id, color) {
        // Cerrar cualquier modal abierto primero
        modalCards.forEach(c => c.classList.remove('active-card'));
        
        const target = document.getElementById(id);
        if(target) {
            // Aplicar el color dinámico al borde y sombras
            target.style.setProperty('--popup-color', color);
            
            overlay.classList.add('active');
            
            // Pequeño delay para la animación CSS
            setTimeout(() => target.classList.add('active-card'), 10);
            
            // Si se abre la galería, actualizar posición de cartas
            if(id === 'modal-2') updateGalleryDeck();
        }
    }

    function closeModal() {
        overlay.classList.remove('active');
        modalCards.forEach(c => c.classList.remove('active-card'));
    }

    // Cerrar al hacer click fuera
    closeArea.addEventListener('click', closeModal);


    // ==========================================
    // 6. GALERÍA SWIPE (ARRASTRAR)
    // ==========================================
    const cards = document.querySelectorAll('.card-3d');
    const swipeArea = document.getElementById('swipe-area');
    let cardIndex = 0;
    
    // Variables para el swipe
    let startX = 0;

    // Detectar inicio (Mouse y Touch)
    swipeArea.addEventListener('mousedown', (e) => startX = e.clientX);
    swipeArea.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);

    // Detectar fin (Mouse y Touch) y calcular dirección
    swipeArea.addEventListener('mouseup', (e) => handleSwipe(e.clientX));
    swipeArea.addEventListener('touchend', (e) => handleSwipe(e.changedTouches[0].clientX));

    function handleSwipe(endX) {
        // Umbral de 50px
        if (startX - endX > 50) {
            // Deslizó a Izquierda -> Siguiente
            cardIndex = getSafeIndex(cardIndex + 1);
            updateGalleryDeck();
        }
        if (endX - startX > 50) {
            // Deslizó a Derecha -> Anterior
            cardIndex = getSafeIndex(cardIndex - 1);
            updateGalleryDeck();
        }
    }

    function updateGalleryDeck() {
        cards.forEach((card, index) => {
            card.className = 'card-3d'; // Limpiar clases
            
            if(index === cardIndex) {
                card.classList.add('active');
            } else if (index === getSafeIndex(cardIndex + 1)) {
                card.classList.add('next');
            } else if (index === getSafeIndex(cardIndex - 1)) {
                card.classList.add('prev');
            }
        });
    }

    function getSafeIndex(i) {
        if (i < 0) return cards.length - 1;
        if (i >= cards.length) return 0;
        return i;
    }


    // ==========================================
    // 7. CONTROLES DEL REPRODUCTOR
    // ==========================================
    function loadTrack(i) {
        tName.innerText = playlist[i].title;
        tArtist.innerText = playlist[i].artist;
        audio.src = playlist[i].file;
    }

    function updatePlayIcon(isPlaying) {
        if(isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    if(playBtn) {
        // Botón Play/Pause
        playBtn.addEventListener('click', () => {
            if(audio.paused) {
                audio.play();
                updatePlayIcon(true);
            } else {
                audio.pause();
                updatePlayIcon(false);
            }
        });

        // Botón Siguiente
        nextBtn.addEventListener('click', () => {
            currentTrack = (currentTrack + 1) % playlist.length;
            loadTrack(currentTrack);
            audio.play();
            updatePlayIcon(true);
        });
    }
});
