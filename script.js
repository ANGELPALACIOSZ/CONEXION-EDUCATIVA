// Datos de mentores de ejemplo
const mentorsData = [
    { id: 1, name: "María García", specialty: "matematicas", specialties: ["Cálculo", "Álgebra"], rating: 4.8, experience: "3 años", availability: "Mañanas" },
    { id: 2, name: "Carlos Ruiz", specialty: "programacion", specialties: ["JavaScript", "Node.js"], rating: 4.9, experience: "4 años", availability: "Fines de semana" },
    { id: 3, name: "Ana López", specialty: "ciencias", specialties: ["Física", "Química"], rating: 4.7, experience: "2 años", availability: "Tardes" },
    { id: 4, name: "David Martínez", specialty: "idiomas", specialties: ["Inglés", "Francés"], rating: 4.6, experience: "5 años", availability: "Mañanas" },
    { id: 5, name: "Laura Torres", specialty: "programacion", specialties: ["Python", "Data Science"], rating: 4.9, experience: "3 años", availability: "Noches" },
    { id: 6, name: "Jorge Silva", specialty: "matematicas", specialties: ["Estadística", "Probabilidad"], rating: 4.5, experience: "2 años", availability: "Tardes" }
];

// Estado de autenticación
let currentUser = localStorage.getItem('loggedUser') || null;

// Verificar login al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showMainContent();
    } else {
        showLogin();
    }
});

// FUNCIONES LOGIN
function showLogin() {
    document.getElementById('loginOverlay').classList.remove('d-none');
    document.getElementById('mainContent').classList.add('d-none');
}

function showMainContent() {
    document.getElementById('loginOverlay').classList.add('d-none');
    document.getElementById('mainContent').classList.remove('d-none');
    loadMentors();
    
    // Mostrar usuario en navbar
    document.getElementById('userBadge').textContent = currentUser.split('_')[0] === 'google' ? 'Google User' : currentUser.split('_')[1];
}

function handleGoogleLogin() {
    const btn = event.target;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Conectando con Google...';
    btn.disabled = true;

    setTimeout(() => {
        currentUser = 'google_user_' + Date.now();
        localStorage.setItem('loggedUser', currentUser);
        showMainContent();
        showNotification('✅ Autenticado con Google exitosamente', 'success');
    }, 2000);
}

function handleEmailLogin(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    currentUser = 'email_' + email.split('@')[0];
    localStorage.setItem('loggedUser', currentUser);
    showMainContent();
    showNotification('✅ Inicio de sesión exitoso', 'success');
}

function logout() {
    localStorage.removeItem('loggedUser');
    currentUser = null;
    showLogin();
    showNotification('Has cerrado sesión', 'info');
}

// FUNCIONES BOTONES PRINCIPALES
function showDemo() {
    document.getElementById('mentors').scrollIntoView({ behavior: 'smooth' });
    showNotification('🎯 Demo activada: Usa los filtros para buscar mentores', 'info');
}

function filterMentors() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const areaFilter = document.getElementById('filterArea')?.value || '';
    
    const filtered = mentorsData.filter(mentor => {
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm) || 
                             mentor.specialties.some(s => s.toLowerCase().includes(searchTerm));
        const matchesArea = !areaFilter || mentor.specialty === areaFilter;
        return matchesSearch && matchesArea;
    });
    
    loadMentors(filtered);
    showNotification(`🔍 ${filtered.length} mentores encontrados`, 'info');
}

function scheduleSession(mentorName) {
    if (!currentUser) {
        showNotification('❌ Debes iniciar sesión primero', 'danger');
        showLogin();
        return;
    }

    const modalId = 'scheduleModal';
    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Agendar sesión con ${mentorName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Fecha y Hora</label>
                            <input type="datetime-local" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tema</label>
                            <select class="form-select">
                                <option>Dudas de clase</option>
                                <option>Preparación de examen</option>
                                <option>Proyectos prácticos</option>
                                <option>Orientación profesional</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary-custom" onclick="confirmSession('${mentorName}')">
                            <i class="fas fa-check me-2"></i>Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    new bootstrap.Modal(document.getElementById(modalId)).show();
    
    // Limpiar modal después de cerrar
    document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function confirmSession(mentorName) {
    bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
    showNotification(`✅ Sesión confirmada con ${mentorName}`, 'success');
}

// HELPERS
function loadMentors(mentors = mentorsData) {
    const grid = document.getElementById('mentorsGrid');
    if (!grid) return;
    
    grid.innerHTML = mentors.map(mentor => `
        <div class="col-md-6 col-lg-4 fade-in">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${mentor.name}</h5>
                    <p class="card-text">
                        ⭐ ${mentor.rating} | ${mentor.experience}<br>
                        <small class="text-muted">${mentor.specialties.join(', ')}</small>
                    </p>
                    <button class="btn btn-primary-custom w-100" onclick="scheduleSession('${mentor.name}')">
                        <i class="fas fa-calendar-plus me-2"></i>Agendar Sesión
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function showNotification(message, type = 'info') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" style="z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) alert.remove();
    }, 4000);
}