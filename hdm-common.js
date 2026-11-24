/* =========================================================
   hdm-common.js — Funciones compartidas del Portal HDM
   - cerrarSesionHDM(): limpia storage y regresa al login
   - initLogoutFlotante(): valida sesión activa en cada página
   - filtrarMenuPorPrivilegio(): (reservado) oculta items según rol
   - getHDMUser(): helper para leer datos del usuario logueado
   ========================================================= */

(function () {
    'use strict';

    // Llaves de localStorage usadas en todo el portal
    const HDM_KEYS = {
        NOMBRE:   'hdm_nombre',
        CARGO:    'hdm_cargo',
        USERNAME: 'hdm_username',
        FOLIO:    'hdm_folio',
        BRANCH:   'hdm_branch'
    };

    // === Lee los datos del usuario guardados tras el login ===
    function getHDMUser() {
        return {
            nombre:   localStorage.getItem(HDM_KEYS.NOMBRE)   || '',
            cargo:    localStorage.getItem(HDM_KEYS.CARGO)    || '',
            username: localStorage.getItem(HDM_KEYS.USERNAME) || '',
            folio:    localStorage.getItem(HDM_KEYS.FOLIO)    || '',
            branch:   localStorage.getItem(HDM_KEYS.BRANCH)   || ''
        };
    }

    // === Verifica si hay sesión activa ===
    function sesionActiva() {
        return !!localStorage.getItem(HDM_KEYS.NOMBRE);
    }

    // === Cerrar sesión: limpia TODO el storage y vuelve al login ===
    function cerrarSesionHDM() {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) { /* noop */ }
        window.location.replace('index.html');
    }

    // === Init logout flotante: en páginas protegidas, si no hay sesión, mandar al login ===
    // Llamar desde cualquier página interna (cuestionarios, globals, etc.)
    function initLogoutFlotante() {
        // Si estamos en index.html o login explícito, no redirigir
        const path = (window.location.pathname.split('/').pop() || '').toLowerCase();
        if (path === 'index.html' || path === '' || path === 'login.html') return;

        if (!sesionActiva()) {
            window.location.replace('index.html');
        }
    }

    // === ¿Es administrador? privilegio '1' o cargo ADMIN ===
    function esAdminHDM() {
        const priv = localStorage.getItem('hdm_privilegio') || localStorage.getItem('privilegio') || '0';
        const cargo = (localStorage.getItem('hdm_cargo') || '').toUpperCase();
        return priv === '1' || cargo.includes('ADMIN');
    }

    // === Filtrar menú por privilegio ===
    // Oculta las secciones de administración (Reportes Globales y Controles)
    // a los usuarios que no son administradores.
    function filtrarMenuPorPrivilegio() {
        const cargo = (localStorage.getItem(HDM_KEYS.CARGO) || '').toUpperCase();
        const admin = esAdminHDM();
        ['menu-global', 'menu-controles'].forEach(function (id) {
            const sec = document.getElementById(id);
            if (sec) sec.style.display = admin ? 'block' : 'none';
        });
        return cargo;
    }

    // === Expone API global ===
    window.HDM_Keys = HDM_KEYS;
    window.getHDMUser = getHDMUser;
    window.sesionActiva = sesionActiva;
    window.cerrarSesionHDM = cerrarSesionHDM;
    window.initLogoutFlotante = initLogoutFlotante;
    window.filtrarMenuPorPrivilegio = filtrarMenuPorPrivilegio;
    window.esAdminHDM = esAdminHDM;
})();
