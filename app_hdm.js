// ====== APP HDM: Layout + Storage + Tabs + Dashboard ======
// Transforma cualquier cuestionario en la app completa con sidebar + tabs

// ====== 1. INYECTAR CSS ======
(function injectAppCSS() {
    const style = document.createElement('style');
    style.textContent = `
        body { height: 100vh !important; overflow: hidden !important; min-height: 100vh !important; }
        .header { position: relative !important; }
        .menu-btn { background: none; border: none; cursor: pointer; color: var(--text-main, #1e293b); padding: 5px; display: flex; align-items: center; }
        .menu-btn i { width: 24px; height: 24px; }
        .header-right { display: flex; align-items: center; gap: 12px; }
        .user-name-top { font-weight: 800; color: var(--primary-blue, #043185); font-size: 14px; text-transform: uppercase; white-space: nowrap; }
        @media (max-width: 768px) { .user-name-top { display: none; } .header-title { display: none; } }
        .user-initial { width: 35px; height: 35px; border-radius: 50%; background-color: var(--primary-blue, #043185); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; flex-shrink: 0; }
        .user-dropdown { position: absolute; top: 60px; right: 15px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid var(--border-color, #e2e8f0); width: 220px; z-index: 1000; display: none; overflow: hidden; }
        .user-dropdown.show { display: block; }
        .user-card { padding: 15px; border-bottom: 1px solid #f1f5f9; }
        .user-card .user-name { font-weight: 700; font-size: 14px; color: var(--text-main, #1e293b); }
        .user-actions .dropdown-link { display: flex; align-items: center; gap: 8px; padding: 12px 15px; color: var(--danger, #dc2626); font-size: 14px; text-decoration: none; font-weight: 500; }
        .main-layout { display: flex; flex: 1; overflow: hidden; height: calc(100vh - 60px); }
        .sidebar { width: 260px; background: white; border-right: 1px solid var(--border-color, #e2e8f0); overflow-y: auto; transition: transform 0.3s ease; display: flex; flex-direction: column; flex-shrink: 0; }
        @media (max-width: 768px) { .sidebar { position: fixed; height: calc(100vh - 60px); transform: translateX(-100%); z-index: 40; top: 60px; } .sidebar.open { transform: translateX(0); } }
        .content { flex: 1; overflow-y: auto !important; -webkit-overflow-scrolling: touch; }
        .tabs-container { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; }
        .tab-btn { background: #eef1f6; border: none; padding: 10px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; color: #555; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap; }
        .tab-btn.active { background: var(--primary-blue, #043185) !important; color: #ffffff !important; }
        .tab-badge { background: #d1d5db; color: #555; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
        .tab-btn.active .tab-badge { background: #ffffff; color: var(--primary-blue, #043185); }
        .data-table-container { background: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid var(--border-color, #e2e8f0); overflow-x: auto; }
        .data-table-container table { width: 100%; border-collapse: collapse; text-align: center; }
        .data-table-container thead { background: var(--light-blue, #eef2ff); border-bottom: 1px solid var(--border-color, #e2e8f0); }
        .data-table-container th { padding: 12px 15px; font-size: 14px; }
        .data-table-container td { padding: 12px 15px; font-size: 14px; color: var(--text-main, #1e293b); }
        .data-table-container tbody tr { border-bottom: 1px solid #f1f5f9; }
        .btn-edit { background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; margin: 2px; }
        .btn-pdf { background: var(--primary-blue, #043185); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; margin: 2px; }
        .fab-delete { position: fixed; bottom: 30px; right: 30px; background: var(--danger, #dc2626); color: white; border: none; border-radius: 50px; padding: 15px 25px; display: none; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 999; font-weight: 700; font-family: 'Inter', sans-serif; font-size: 14px; transition: transform 0.2s; }
        .fab-delete:hover { background: #b91c1c; transform: scale(1.05); }
        #custom-confirm { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 10001; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; }
        .modal-card-confirm { background: white; border-radius: 12px; padding: 24px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .confirm-icon { width: 50px; height: 50px; background: #fee2e2; color: var(--danger, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; }
        #custom-confirm #confirm-title { margin: 0 0 8px 0; font-size: 18px; color: var(--text-main, #1e293b); font-weight: 700; }
        #custom-confirm #confirm-msg { margin: 0 0 24px 0; font-size: 14px; color: var(--text-muted, #64748b); line-height: 1.5; }
        .confirm-actions { display: flex; gap: 12px; }
        #confirm-cancel { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; font-weight: 700; font-size: 14px; cursor: pointer; }
        #confirm-ok { flex: 1; padding: 12px; border-radius: 8px; border: none; color: white; background: var(--danger, #dc2626); font-weight: 700; font-size: 14px; cursor: pointer; }
        .hdm-folio-banner { display: flex; align-items: center; gap: 8px; background: linear-gradient(90deg, #eef2ff, #e0e7ff); border: 1px solid #c7d2fe; border-left: 4px solid var(--primary-blue, #043185); border-radius: 10px; padding: 10px 16px; margin-bottom: 16px; font-size: 14px; color: var(--text-main, #1e293b); font-weight: 600; }
        .hdm-folio-banner .folio-label { color: var(--text-muted, #64748b); font-weight: 500; }
        .hdm-folio-banner .folio-value { color: var(--primary-blue, #043185); font-weight: 800; font-size: 15px; letter-spacing: 0.5px; }
        .hdm-folio-banner i { width: 18px; height: 18px; color: var(--primary-blue, #043185); }
        .estado-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-block; }
        .estado-pendiente { background: #fef3c7; color: #b45309; }
        .estado-aceptado { background: #dcfce7; color: #15803d; }
        .estado-rechazado { background: #fee2e2; color: #b91c1c; }
        .btn-accept { background: var(--success, #10b981); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; margin: 2px; }
        .btn-reject { background: var(--danger, #dc2626); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; margin: 2px; }
        .btn-view { background: #6366f1; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; margin: 2px; }
        #hdm-saving-overlay { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.55); z-index: 10002; justify-content: center; align-items: center; }
        #hdm-saving-overlay.show { display: flex; }
        .saving-card { background: white; border-radius: 14px; padding: 28px 36px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
        .saving-spinner { width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top-color: var(--primary-blue, #043185); border-radius: 50%; margin: 0 auto 14px; animation: hdm-spin 0.8s linear infinite; }
        @keyframes hdm-spin { to { transform: rotate(360deg); } }
        .saving-card p { margin: 0; font-size: 15px; color: var(--text-main, #1e293b); font-weight: 600; }
    `;
    document.head.appendChild(style);
})();

// ====== 2. HDM_Store: Capa de datos (localStorage) ======
const HDM_Store = {
    KEY: 'hdm_reportes',

    obtenerTodos() {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch(e) { console.error('Error leyendo reportes:', e); return []; }
    },

    obtenerPorEstado(estado, tipo) {
        return this.obtenerTodos().filter(r => {
            if (r.estado !== estado) return false;
            if (tipo && r.tipo !== tipo) return false;
            return true;
        });
    },

    obtenerPorId(id) {
        return this.obtenerTodos().find(r => r.id === id);
    },

    guardar(reporte) {
        const todos = this.obtenerTodos();
        if (reporte.id) {
            const idx = todos.findIndex(r => r.id === reporte.id);
            if (idx > -1) {
                todos[idx] = { ...todos[idx], ...reporte, fecha_modificacion: new Date().toISOString() };
            } else {
                reporte.fecha_creacion = new Date().toISOString();
                todos.unshift(reporte);
            }
        } else {
            reporte.id = 'hdm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            reporte.fecha_creacion = new Date().toISOString();
            todos.unshift(reporte);
        }
        try {
            localStorage.setItem(this.KEY, JSON.stringify(todos));
            return reporte.id;
        } catch(e) {
            console.error('Error guardando reporte:', e);
            // Si excede el límite de localStorage, guardar sin las fotos
            if (reporte.data) {
                const dataLite = { ...reporte.data };
                // Remover fotos para reducir tamaño
                Object.keys(dataLite).forEach(k => {
                    if (typeof dataLite[k] === 'string' && dataLite[k].startsWith('data:image')) dataLite[k] = null;
                    if (dataLite[k] && typeof dataLite[k] === 'object') {
                        Object.keys(dataLite[k]).forEach(k2 => {
                            if (typeof dataLite[k][k2] === 'string' && dataLite[k][k2].startsWith('data:image')) dataLite[k][k2] = null;
                        });
                    }
                });
                reporte.data = dataLite;
                try { localStorage.setItem(this.KEY, JSON.stringify(todos)); return reporte.id; }
                catch(e2) { console.error('Error guardando reporte lite:', e2); return null; }
            }
            return null;
        }
    },

    eliminar(id) {
        const todos = this.obtenerTodos().filter(r => r.id !== id);
        localStorage.setItem(this.KEY, JSON.stringify(todos));
    },

    eliminarMultiples(ids) {
        const todos = this.obtenerTodos().filter(r => !ids.includes(r.id));
        localStorage.setItem(this.KEY, JSON.stringify(todos));
    },

    contar(estado, tipo) {
        return this.obtenerPorEstado(estado, tipo).length;
    }
};

// ====== 3. HDM_App: Lógica de la interfaz ======
const HDM_App = {
    urlParams: new URLSearchParams(window.location.search),
    tabActual: 'nuevo',
    editIdActual: null,
    reportes: [],

    init() {
        // Verificar login o params del portal
        const usuario = localStorage.getItem('hdm_usuario') || localStorage.getItem('usuario') || localStorage.getItem('hdm_nombre') || localStorage.getItem('nombre');
        const hasPortalParams = this.urlParams.has('folio') || this.urlParams.has('userName');
        if (!usuario && !hasPortalParams) return; // Modo standalone, no transformar

        const nombre = localStorage.getItem('hdm_nombre') || localStorage.getItem('nombre') || this.urlParams.get('userName') || 'Usuario';
        const privilegio = localStorage.getItem('hdm_privilegio') || localStorage.getItem('privilegio') || '0';

        this.transformarPagina(nombre);
        this.cargarSidebar();
        this.configurarPermisos(privilegio);
        this.cargarReportes();

        // Tab inicial desde URL
        const tabUrl = this.urlParams.get('tab') || 'nuevo';
        setTimeout(() => {
            this.cambiarTab(tabUrl);
            this.manejarEdicion();
            this.wrapFunciones();
            if (window.lucide) lucide.createIcons();
        }, 50);
    },

    transformarPagina(nombre) {
        const header = document.querySelector('.header');
        if (!header) return;

        // 1. Añadir botón de menú al header-left
        const headerLeft = header.querySelector('.header-left');
        if (headerLeft && !document.getElementById('toggle-menu')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'menu-btn';
            menuBtn.id = 'toggle-menu';
            menuBtn.innerHTML = '<i data-lucide="menu"></i>';
            menuBtn.onclick = () => document.getElementById('sidebar')?.classList.toggle('open');
            headerLeft.insertBefore(menuBtn, headerLeft.firstChild);
        }

        // 2. Reemplazar header-right con info de usuario
        const headerRight = header.querySelector('.header-right');
        if (headerRight && !headerRight.querySelector('.user-initial')) {
            const badge = headerRight.querySelector('.badge-formato');
            headerRight.innerHTML = `
                <span class="user-name-top">${nombre}</span>
                <div class="user-initial" onclick="document.getElementById('user-dropdown').classList.toggle('show')">${nombre.charAt(0).toUpperCase()}</div>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="user-card"><div class="user-name">${nombre}</div></div>
                    <div class="user-actions"><a href="index.html" class="dropdown-link" onclick="localStorage.clear(); sessionStorage.clear();"><i data-lucide="log-out" style="width:16px;"></i> Cerrar sesión</a></div>
                </div>`;
            if (badge) headerRight.appendChild(badge);
        }

        // 3. Crear main-layout y mover content
        const content = document.querySelector('main.content');
        if (!content || content.parentElement.classList.contains('main-layout')) return;

        const mainLayout = document.createElement('div');
        mainLayout.className = 'main-layout';

        // 4. Crear sidebar
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        sidebar.id = 'sidebar';

        // 5. Insertar sidebar + content en main-layout
        mainLayout.appendChild(sidebar);
        mainLayout.appendChild(content);
        header.parentNode.insertBefore(mainLayout, header.nextSibling);

        // 6. En container: añadir tabs y reestructurar
        const container = content.querySelector('.container');
        if (!container || container.querySelector('.tabs-container')) return;

        // Crear tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs-container';
        tabsContainer.innerHTML = `
            <button class="tab-btn active" onclick="HDM_App.cambiarTab('nuevo')" id="tab-nuevo"><i data-lucide="plus-circle" style="width:16px"></i> Nuevo</button>
            <button class="tab-btn" onclick="HDM_App.cambiarTab('guardados')" id="tab-guardados">Guardados <span class="tab-badge" id="badge-borrador">0</span></button>
            <button class="tab-btn" onclick="HDM_App.cambiarTab('realizados')" id="tab-realizados">Realizados <span class="tab-badge" id="badge-realizado">0</span></button>
            <button class="tab-btn" onclick="HDM_App.cambiarTab('aceptados')" id="tab-aceptados">Aceptados <span class="tab-badge" id="badge-aceptado">0</span></button>
            <button class="tab-btn" onclick="HDM_App.cambiarTab('rechazados')" id="tab-rechazados">Rechazados <span class="tab-badge" id="badge-rechazado">0</span></button>`;

        // Crear form-section (envolver contenido existente)
        const formSection = document.createElement('div');
        formSection.id = 'form-section';

        // Crear dashboard-section
        const dashboardSection = document.createElement('div');
        dashboardSection.id = 'dashboard-section';
        dashboardSection.style.display = 'none';
        dashboardSection.innerHTML = `
            <div class="data-table-container">
                <table>
                    <thead><tr><th style="width:40px;"><input type="checkbox" onclick="HDM_App.toggleAll(this)"></th><th>Folio</th><th>Dirección</th><th>Fecha</th><th>Acción</th></tr></thead>
                    <tbody id="tabla-reportes"><tr><td colspan="5" style="padding:30px;color:#64748b;">Cargando...</td></tr></tbody>
                </table>
            </div>`;

        // Mover contenido existente al form-section
        const hijos = Array.from(container.children);
        hijos.forEach(hijo => { formSection.appendChild(hijo); });

        // Insertar tabs, form-section, dashboard-section
        container.appendChild(tabsContainer);
        container.appendChild(formSection);
        container.appendChild(dashboardSection);

        // 6b. Banner de folio automático (al inicio del form-section)
        if (!document.getElementById('hdm-folio-banner')) {
            const folioBanner = document.createElement('div');
            folioBanner.id = 'hdm-folio-banner';
            folioBanner.className = 'hdm-folio-banner';
            folioBanner.innerHTML = '<i data-lucide="hash"></i> <span class="folio-label">Folio:</span> <span class="folio-value" id="hdm-folio-value">Sin asignar (se genera al guardar)</span>';
            formSection.insertBefore(folioBanner, formSection.firstChild);
        }

        // 6c. Overlay de "guardando" (sincronización Firebase)
        if (!document.getElementById('hdm-saving-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'hdm-saving-overlay';
            overlay.innerHTML = '<div class="saving-card"><div class="saving-spinner"></div><p id="hdm-saving-msg">Guardando...</p></div>';
            document.body.appendChild(overlay);
        }

        // 7. Añadir FAB delete
        if (!document.querySelector('.fab-delete')) {
            const fabDelete = document.createElement('button');
            fabDelete.className = 'fab-delete';
            fabDelete.innerHTML = '<i data-lucide="trash-2" style="width:20px;height:20px"></i> Eliminar';
            fabDelete.onclick = () => HDM_App.eliminarSeleccionados();
            document.body.appendChild(fabDelete);
        }

        // 8. Añadir modal de confirmación si no existe
        if (!document.getElementById('custom-confirm')) {
            const confirmModal = document.createElement('div');
            confirmModal.id = 'custom-confirm';
            confirmModal.innerHTML = `
                <div class="modal-card-confirm">
                    <div class="confirm-icon"><i data-lucide="alert-triangle" style="width:28px;height:28px"></i></div>
                    <h3 id="confirm-title">¿Eliminar?</h3>
                    <p id="confirm-msg">¿Seguro que deseas eliminar los elementos seleccionados?</p>
                    <div class="confirm-actions"><button id="confirm-cancel">Cancelar</button><button id="confirm-ok">Eliminar</button></div>
                </div>`;
            document.body.appendChild(confirmModal);
        }

        // 9. Cerrar dropdown al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (!e.target.matches('.user-initial') && !e.target.closest('.user-dropdown')) {
                const dd = document.getElementById('user-dropdown');
                if (dd && dd.classList.contains('show')) dd.classList.remove('show');
            }
        });
    },

    cargarSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        fetch('menu_hdm.html?v=' + Date.now())
            .then(res => res.text())
            .then(html => {
                sidebar.innerHTML = html;
                if (window.lucide) lucide.createIcons();
            })
            .catch(e => { console.error('Error cargando sidebar:', e); sidebar.innerHTML = '<p style="padding:20px;color:#64748b">Error cargando menú</p>'; });
    },

    configurarPermisos(privilegio) {
        // Admin = privilegio '1' o cargo que contenga ADMIN
        const cargo = (localStorage.getItem('hdm_cargo') || '').toUpperCase();
        const esAdmin = privilegio === '1' || cargo.includes('ADMIN');
        const menuControles = document.getElementById('menu-controles');
        if (menuControles) menuControles.style.display = esAdmin ? 'block' : 'none';
    },

    // Helpers de usuario / folio / overlay
    // Lee el TIPO del cuestionario: los cuestionarios declaran `const TIPO = '...'`
    // (ámbito léxico global, no propiedad de window), por eso se lee con typeof.
    getTipoActual() {
        try { if (typeof TIPO !== 'undefined' && TIPO) return TIPO; } catch (e) {}
        return window.TIPO || '';
    },

    getUsuarioInfo() {
        return {
            username: localStorage.getItem('hdm_username') || localStorage.getItem('hdm_usuario') || localStorage.getItem('usuario') || 'usuario',
            nombre: localStorage.getItem('hdm_nombre') || localStorage.getItem('nombre') || 'Usuario',
            cargo: localStorage.getItem('hdm_cargo') || localStorage.getItem('hdm_position') || ''
        };
    },

    actualizarBannerFolio(folio) {
        const val = document.getElementById('hdm-folio-value');
        if (!val) return;
        if (folio) {
            val.textContent = folio;
            val.style.color = 'var(--primary-blue, #043185)';
        } else {
            val.textContent = 'Sin asignar (se genera al guardar)';
        }
        if (window.HDM_FOLIO !== folio) window.HDM_FOLIO = folio || window.HDM_FOLIO || '';
    },

    mostrarGuardando(msg) {
        const ov = document.getElementById('hdm-saving-overlay');
        const m = document.getElementById('hdm-saving-msg');
        if (m) m.textContent = msg || 'Guardando...';
        if (ov) ov.classList.add('show');
    },

    ocultarGuardando() {
        const ov = document.getElementById('hdm-saving-overlay');
        if (ov) ov.classList.remove('show');
    },

    async cargarReportes() {
        const tipo = this.getTipoActual();
        try {
            if (window.HDM_Firebase) {
                if (!HDM_Firebase.isReady()) await HDM_Firebase.ready;
                if (HDM_Firebase.isReady()) {
                    this.reportes = await HDM_Firebase.listarReportes(tipo);
                } else {
                    this.reportes = HDM_Store.obtenerTodos().filter(r => r.tipo === tipo);
                }
            } else {
                this.reportes = HDM_Store.obtenerTodos().filter(r => r.tipo === tipo);
            }
        } catch (e) {
            console.warn('[HDM] cargarReportes: fallback localStorage', e && e.message);
            this.reportes = HDM_Store.obtenerTodos().filter(r => r.tipo === tipo);
        }
        this.actualizarBadges();
        // Si estamos en un tab de dashboard, refrescar la tabla
        if (['guardados','realizados','aceptados','rechazados'].includes(this.tabActual)) this.renderTabla();
    },

    actualizarBadges() {
        let b = 0, r = 0, ac = 0, re = 0;
        this.reportes.forEach(rep => {
            if (rep.estado === 'Borrador') b++;
            else if (rep.estado === 'Realizado') r++;
            const ec = rep.estadoControl || 'pendiente';
            if (ec === 'aceptado') ac++;
            else if (ec === 'rechazado') re++;
        });
        const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
        set('badge-borrador', b);
        set('badge-realizado', r);
        set('badge-aceptado', ac);
        set('badge-rechazado', re);
    },

    cambiarTab(tab) {
        this.tabActual = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const activeTab = document.getElementById('tab-' + tab);
        if (activeTab) activeTab.classList.add('active');

        const formSection = document.getElementById('form-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const fabDelete = document.querySelector('.fab-delete');

        if (tab === 'nuevo') {
            if (formSection) formSection.style.display = 'block';
            if (dashboardSection) dashboardSection.style.display = 'none';
            if (fabDelete) fabDelete.style.display = 'none';
        } else {
            if (formSection) formSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (fabDelete) fabDelete.style.display = 'flex';
            this.renderTabla();
        }

        // Actualizar link activo del sidebar: todos los tabs (nuevo/guardados/realizados/aceptados/rechazados)
        // pertenecen al mismo cuestionario, así que se resalta el link del cuestionario actual.
        document.querySelectorAll('.sidebar-section .nav-item').forEach(item => item.classList.remove('active'));
        const tipo = this.getTipoActual();
        const linkMap = {
            'correctivo': 'link-correctivo',
            'instalaciones': 'link-instalaciones',
            'reporte_visitas': 'link-reporte-visitas',
            'mantenimiento_1': 'link-mantenimiento-1',
            'mantenimiento_2': 'link-mantenimiento-2',
            'mantenimiento_3': 'link-mantenimiento-3',
            'mantenimiento_4': 'link-mantenimiento-4'
        };
        document.getElementById(linkMap[tipo] || '')?.classList.add('active');

        // Cerrar sidebar en móvil
        document.getElementById('sidebar')?.classList.remove('open');
    },

    renderTabla() {
        const tbody = document.getElementById('tabla-reportes');
        if (!tbody) return;
        const tab = this.tabActual;
        let filtered;
        if (tab === 'aceptados') filtered = this.reportes.filter(r => (r.estadoControl || 'pendiente') === 'aceptado');
        else if (tab === 'rechazados') filtered = this.reportes.filter(r => (r.estadoControl || 'pendiente') === 'rechazado');
        else if (tab === 'realizados') filtered = this.reportes.filter(r => r.estado === 'Realizado');
        else filtered = this.reportes.filter(r => r.estado === 'Borrador'); // guardados

        // Ordenar por fecha desc (de la más reciente a la más antigua)
        filtered = filtered.slice().sort((a, b) => (b.fecha_creacion || '').localeCompare(a.fecha_creacion || ''));

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding:30px;color:#64748b">Sin reportes en esta sección</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        filtered.forEach(rep => {
            let acciones = `<div style="display:flex;gap:5px;justify-content:center;">
                <button type="button" onclick="HDM_App.cargarEdicion('${rep.id}')" class="btn-edit"><i data-lucide="edit-2" style="width:14px"></i> Editar</button>`;
            if (rep.estado === 'Realizado') {
                acciones += `<button type="button" onclick="HDM_App.verPDFReporte('${rep.id}')" class="btn-pdf"><i data-lucide="file-text" style="width:14px"></i> PDF</button>`;
            }
            acciones += `</div>`;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><input type="checkbox" class="check-rep" data-id="${rep.id}"></td>
                <td style="font-weight:bold">${rep.folio || '—'}</td>
                <td>${rep.direccion || '—'}</td>
                <td>${(rep.fecha_creacion || '').split('T')[0] || '—'}</td>
                <td>${acciones}</td>`;
            tbody.appendChild(tr);
        });
        if (window.lucide) lucide.createIcons();
    },

    async cargarEdicion(id) {
        let rep = null;
        try {
            if (window.HDM_Firebase) { if (!HDM_Firebase.isReady()) await HDM_Firebase.ready; if (HDM_Firebase.isReady()) rep = await HDM_Firebase.obtenerReporte(id); }
        } catch (e) { console.warn('[HDM] cargarEdicion Firebase:', e && e.message); }
        if (!rep) rep = HDM_Store.obtenerPorId(id);
        if (!rep || !rep.data) { if (typeof showCustomAlert === 'function') showCustomAlert('Error', 'Reporte no encontrado.', false); return; }
        this.editIdActual = id;
        this.actualizarBannerFolio(rep.folio || '');
        if (typeof cargarBorrador === 'function') cargarBorrador(rep.data);
        this.cambiarTab('nuevo');
    },

    async verPDFReporte(id) {
        let rep = null;
        try {
            if (window.HDM_Firebase) { if (!HDM_Firebase.isReady()) await HDM_Firebase.ready; if (HDM_Firebase.isReady()) rep = await HDM_Firebase.obtenerReporte(id); }
        } catch (e) { console.warn('[HDM] verPDFReporte Firebase:', e && e.message); }
        if (!rep) rep = HDM_Store.obtenerPorId(id);
        if (!rep || !rep.data) { if (typeof showCustomAlert === 'function') showCustomAlert('Error', 'Reporte no encontrado.', false); return; }
        try {
            sessionStorage.setItem('DatosCuestionarioHDM', JSON.stringify(rep.data));
            window.open(window.PDF_URL || '', '_blank');
        } catch(e) { if (typeof showCustomAlert === 'function') showCustomAlert('Error', 'No se pudo abrir el PDF: ' + e.message, false); }
    },

    toggleAll(source) {
        document.querySelectorAll('.check-rep').forEach(cb => cb.checked = source.checked);
    },

    eliminarSeleccionados() {
        const checks = document.querySelectorAll('.check-rep:checked');
        if (checks.length === 0) {
            this.showConfirm('Atención', 'Selecciona al menos un reporte para eliminar.', () => {});
            return;
        }
        this.showConfirm(`Eliminar ${checks.length} reporte(s)`, 'Esta acción no se puede deshacer. ¿Deseas continuar?', () => {
            const ids = Array.from(checks).map(c => c.dataset.id);
            HDM_Store.eliminarMultiples(ids);
            if (typeof showCustomAlert === 'function') showCustomAlert('Éxito', 'Reportes eliminados.', true);
            this.cargarReportes();
            this.renderTabla();
        });
    },

    showConfirm(title, msg, onConfirm) {
        const modal = document.getElementById('custom-confirm');
        if (!modal) { if (confirm(msg)) onConfirm(); return; }
        document.getElementById('confirm-title').innerText = title;
        document.getElementById('confirm-msg').innerText = msg;
        modal.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
        document.getElementById('confirm-ok').onclick = function() { modal.style.display = 'none'; onConfirm(); };
        document.getElementById('confirm-cancel').onclick = function() { modal.style.display = 'none'; };
    },

    async manejarEdicion() {
        const editId = this.urlParams.get('edit');
        if (!editId) return;
        let rep = null;
        try {
            if (window.HDM_Firebase) { if (!HDM_Firebase.isReady()) await HDM_Firebase.ready; if (HDM_Firebase.isReady()) rep = await HDM_Firebase.obtenerReporte(editId); }
        } catch (e) { console.warn('[HDM] manejarEdicion Firebase:', e && e.message); }
        if (!rep) rep = HDM_Store.obtenerPorId(editId);
        if (!rep || !rep.data) return;
        this.editIdActual = editId;
        this.actualizarBannerFolio(rep.folio || '');
        if (typeof cargarBorrador === 'function') cargarBorrador(rep.data);
    },

    wrapFunciones() {
        // Reemplazar guardarBorrador y verPDF con versiones que usan Firebase
        // (folio automático + subida de fotos a Storage + Firestore) y conservan
        // localStorage como caché/respaldo offline.
        const self = this;
        const TIPO = self.getTipoActual() || 'desconocido';

        function validarDatos(datos) {
            if (!datos.direccion) { if (typeof showCustomAlert === 'function') showCustomAlert('Atención', 'Captura la dirección del servicio.', false); return false; }
            if (!datos.proveedor || !datos.proveedor.nombre) { if (typeof showCustomAlert === 'function') showCustomAlert('Atención', 'Captura el nombre del empleado del proveedor.', false); return false; }
            return true;
        }

        // Proceso central de guardado: folio + fotos + Firestore + cache local
        async function procesarGuardado(estado, requiereRecibe) {
            if (typeof recopilarDatos !== 'function') return;
            const datos = recopilarDatos();
            if (!validarDatos(datos)) return;
            if (requiereRecibe && (!datos.recibe || !datos.recibe.nombre)) {
                if (typeof showCustomAlert === 'function') showCustomAlert('Atención', 'Captura el nombre de quien recibe el trabajo.', false);
                return;
            }

            // 1. Folio automático (si no existe todavía)
            let folio = window.HDM_FOLIO || datos.folio || '';
            if (!folio) {
                self.mostrarGuardando('Generando folio...');
                try {
                    if (window.HDM_Firebase) {
                        if (!HDM_Firebase.isReady()) await HDM_Firebase.ready;
                        folio = await HDM_Firebase.generarFolio(TIPO);
                    }
                } catch (e) { console.warn('[HDM] generarFolio:', e && e.message); }
                if (folio) { window.HDM_FOLIO = folio; datos.folio = folio; self.actualizarBannerFolio(folio); }
            } else {
                datos.folio = folio;
                self.actualizarBannerFolio(folio);
            }

            const userInfo = self.getUsuarioInfo();

            // 2. Subir fotos/firma (base64) a Storage → URL
            self.mostrarGuardando(estado === 'Realizado' ? 'Finalizando y sincronizando...' : 'Guardando borrador...');
            let datosParaGuardar = datos;
            try {
                if (window.HDM_Firebase && HDM_Firebase.isReady() && folio) {
                    datosParaGuardar = await HDM_Firebase.subirFotosDeDatos(TIPO, folio, datos);
                }
            } catch (e) { console.warn('[HDM] subirFotosDeDatos:', e && e.message); }

            // 3. Guardar en Firestore (si está listo)
            let id = self.editIdActual || null;
            const reporteBase = {
                folio: folio,
                tipo: TIPO,
                estado: estado,
                estadoControl: 'pendiente',
                usuario: userInfo.username,
                usuario_nombre: userInfo.nombre,
                usuario_cargo: userInfo.cargo,
                direccion: datos.direccion || '',
                sucursal: localStorage.getItem('hdm_branch') || '',
                data: datosParaGuardar
            };

            let firebaseOk = false;
            try {
                if (window.HDM_Firebase && HDM_Firebase.isReady()) {
                    id = await HDM_Firebase.guardarReporte(Object.assign({ id: id }, reporteBase));
                    firebaseOk = true;
                }
            } catch (e) { console.warn('[HDM] guardarReporte Firebase:', e && e.message); }

            // 4. Caché local (siempre, como respaldo offline) — usa el mismo id
            try {
                const localId = HDM_Store.guardar(Object.assign({ id: id }, reporteBase, { data: datos }));
                if (localId) id = localId;
            } catch (e) { console.warn('[HDM] cache local:', e && e.message); }
            if (id) self.editIdActual = id;

            self.ocultarGuardando();
            await self.cargarReportes();

            if (estado === 'Realizado') {
                try {
                    sessionStorage.setItem('DatosCuestionarioHDM', JSON.stringify(datosParaGuardar));
                    window.open(window.PDF_URL || '', '_blank');
                } catch (e) {
                    if (typeof showCustomAlert === 'function') showCustomAlert('Error', 'No se pudo abrir el PDF: ' + e.message, false);
                }
            }
            const pref = firebaseOk ? 'Éxito' : 'Aviso';
            const cuerpo = (estado === 'Realizado' ? 'Reporte finalizado' : 'Borrador guardado') +
                (firebaseOk ? '.' : ' (local, sin sincronizar).') +
                (folio ? ' Folio: ' + folio : '');
            if (typeof showCustomAlert === 'function') showCustomAlert(pref, cuerpo, true);
        }

        window.guardarBorrador = function () { procesarGuardado('Borrador', false); };
        window.verPDF = function () { procesarGuardado('Realizado', true); };
    }
};

// ====== 4. INIT ======
document.addEventListener('DOMContentLoaded', () => { HDM_App.init(); });
