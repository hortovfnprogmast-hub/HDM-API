// ====== INTEGRACIÓN CON PORTAL HDM ======
// Lee parámetros URL del Portal Operativo y precarga el cuestionario
// Parámetros: ?folio=HDM-XXXXX&userName=NOMBRE&position=CARGO&branch=SUCURSAL
(function(){
    const params = new URLSearchParams(window.location.search);
    const folio = params.get('folio') || '';
    const userName = (params.get('userName') || params.get('name') || '').trim();
    const position = (params.get('position') || params.get('cargo') || '').trim();
    const branch = (params.get('branch') || params.get('sucursal') || '').trim();
    const celular = (params.get('celular') || '').trim();

    // Guardar folio globalmente para que recopilarDatos() lo incluya
    window.HDM_FOLIO = folio;

    document.addEventListener('DOMContentLoaded', () => {
        // 1. Crear banner de folio en la parte superior
        if (folio) {
            const banner = document.createElement('div');
            banner.id = 'folio-banner';
            banner.style.cssText = 'position:sticky;top:0;z-index:999;background:linear-gradient(135deg,#043185,#005B9A);color:white;padding:10px 20px;text-align:center;font-weight:700;font-size:15px;letter-spacing:1px;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;';
            banner.innerHTML =
                '<span style="font-size:11px;opacity:0.8;text-transform:uppercase;">Folio:</span>' +
                '<span style="font-size:18px;font-weight:800;">' + folio + '</span>' +
                (userName ? '<span style="font-size:11px;opacity:0.8;margin-left:15px;">|</span><span style="font-size:12px;opacity:0.9;">' + userName + '</span>' : '') +
                (branch ? '<span style="font-size:11px;opacity:0.8;margin-left:10px;">|</span><span style="font-size:12px;opacity:0.9;">' + branch + '</span>' : '');
            document.body.insertBefore(banner, document.body.firstChild);
        }

        // 2. Precargar campos del proveedor (empleado HDM que hace el mantenimiento)
        // Solo si el campo está vacío (no sobrescribir un borrador restaurado)
        function setIfEmpty(id, value) {
            if (!value) return;
            const el = document.getElementById(id);
            if (el && !el.value.trim()) {
                el.value = value;
                el.dispatchEvent(new Event('input'));
            }
        }

        setIfEmpty('prov_nombre', userName.toUpperCase());
        setIfEmpty('prov_cargo', position.toUpperCase());
        setIfEmpty('prov_celular', celular);

        // 3. Precargar dirección con la sucursal detectada
        setIfEmpty('direccion', branch);

        // 4. Marcar visualmente los campos precargados
        ['prov_nombre','prov_cargo','prov_celular','direccion'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value.trim()) {
                el.style.borderColor = '#005B9A';
                el.style.backgroundColor = '#eef2ff';
            }
        });
    });
})();
