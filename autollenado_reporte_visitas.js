// ====== AUTOLLENADO PDF REPORTE DE VISITAS ======
(function(){
    const raw = sessionStorage.getItem('DatosCuestionarioHDM');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || data.tipo !== 'reporte_visitas') return;

    const FOTO_LABELS = ['AGUA CRUDA','AGUA SUAVE','AGUA OSMOTICA','SUBE TINACO','BAJA TINACO','AGUA CALIENTE','LLENADO (CISTERNA)','SUCCIÓN (CISTERNA)','OTROS'];

    // ===== FOLIO =====
    if (data.folio) { document.querySelectorAll('.pdf-folio-value').forEach(el => { el.textContent = data.folio; }); }

    // ===== FOTO UBICACIÓN =====
    if (data.foto_ubicacion) {
        const page = document.querySelector('.page');
        if (page && !page.querySelector('.foto-ubicacion-overlay')) {
            const img = document.createElement('img');
            img.src = data.foto_ubicacion;
            img.className = 'foto-ubicacion-overlay';
            img.style.cssText = 'position:absolute;top:6mm;right:6mm;width:22mm;height:22mm;object-fit:cover;border:1.5px solid #043185;z-index:10;';
            page.appendChild(img);
        }
    }

    // ===== HEADER: PROYECTO, CALLE, COLONIA, CIUDAD =====
    document.querySelectorAll('.radios-left div').forEach(div => {
        const txt = div.textContent.toUpperCase();
        if (txt.includes('PROYECTO') && !txt.includes('FOLIO')) {
            if (data.proyecto) div.innerHTML = '<input type="radio" checked> PROYECTO: <strong>' + data.proyecto + '</strong>';
        } else if (txt.includes('CALLE:')) {
            div.innerHTML = '<input type="radio" checked> Calle: <strong>' + (data.direccion || '—') + '</strong>';
        } else if (txt.includes('COLONIA:')) {
            div.innerHTML = '<input type="radio" checked> Colonia: <strong>' + (data.colonia || '—') + '</strong>';
        } else if (txt.includes('CIUDAD:')) {
            div.innerHTML = '<input type="radio" checked> Ciudad: <strong>' + (data.ciudad || '—') + '</strong>';
        }
    });

    // ===== EMPLEADO PROVEEDOR =====
    document.querySelectorAll('.provider-fields').forEach(pf => {
        const divs = pf.querySelectorAll('div');
        if (divs[0]) divs[0].innerHTML = '<input type="radio" checked> NOMBRE: <strong>' + (data.proveedor?.nombre || '—') + '</strong>';
        if (divs[1]) divs[1].innerHTML = '<input type="radio" checked> CARGO: <strong>' + (data.proveedor?.cargo || '—') + '</strong>';
        if (divs[2]) divs[2].innerHTML = '<input type="radio" checked> CELULAR: <strong>' + (data.proveedor?.celular || '—') + '</strong>';
    });

    // ===== FOTO PROVEEDOR =====
    if (data.proveedor?.foto) {
        document.querySelectorAll('.logo-box').forEach(lb => {
            if (lb.querySelector('.foto-proveedor-overlay')) return;
            const img = document.createElement('img');
            img.src = data.proveedor.foto;
            img.className = 'foto-proveedor-overlay';
            img.style.cssText = 'max-height:30px;max-width:100%;margin-top:3px;border:1px solid #043185;object-fit:cover;';
            lb.appendChild(img);
        });
    }

    // ===== MIDDLE COLS: FECHA, UBICACIÓN, PERMISOS =====
    document.querySelectorAll('.box-container').forEach(container => {
        const header = container.querySelector('.box-header');
        const body = container.querySelector('.box-body');
        if (!header || !body) return;
        const ht = header.textContent.toUpperCase();

        if (ht.includes('FECHA DE ENTREGA')) {
            body.innerHTML = '<div><input type="radio" checked> FECHA: <strong>' + (data.fecha_entrega || '—') + '</strong></div>';
        } else if (ht.includes('UBICACIÓN DE ACCESO') || ht.includes('UBICACI')) {
            body.innerHTML =
                '<div><input type="radio" checked> CORDENADAS: <strong>' + (data.coordenadas || '—') + '</strong></div>' +
                '<div><input type="radio" checked> HORARIO ENTRADA: <strong>' + (data.horario_entrada || '—') + '</strong></div>' +
                '<div><input type="radio" checked> HORARIO DE SALIDA: <strong>' + (data.horario_salida || '—') + '</strong></div>' +
                '<div><input type="radio" checked> JORNADA: <strong>' + (data.jornada || '—') + '</strong></div>';
        } else if (ht.includes('PERMISOS') && data.permisos) {
            body.innerHTML = '<div style="font-size:8px;line-height:1.4;font-weight:normal;">' + data.permisos + '</div>';
        }
    });

    // ===== TABLAS =====
    function findRow(table, searchText) {
        for (const row of table.querySelectorAll('tr')) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0 && cells[0].textContent.toUpperCase().includes(searchText.toUpperCase())) return cells;
        }
        return null;
    }
    function fillCell(cells, idx, value) {
        if (!value || value === '—' || !cells || !cells[idx]) return;
        cells[idx].textContent = value;
        cells[idx].style.textAlign = 'center';
        cells[idx].style.fontWeight = '600';
    }

    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const headerText = table.querySelector('th')?.textContent.toUpperCase() || '';
        // Análisis físico-químico
        if (headerText.includes('PERMISIBLES') || headerText.includes('CLORO')) {
            const params = ['cloro','ph','dureza','tds','alcalinidad','cloruros','otros'];
            const cruda = findRow(table, 'AGUA CRUDA');
            const filtrada = findRow(table, 'AGUA FILTRADA');
            const osmotica = findRow(table, 'AGUA OSM');
            if (cruda) params.forEach((p, i) => fillCell(cruda, i+1, data.analisis_agua?.agua_cruda?.[p]));
            if (filtrada) params.forEach((p, i) => fillCell(filtrada, i+1, data.analisis_agua?.agua_filtrada?.[p]));
            if (osmotica) params.forEach((p, i) => fillCell(osmotica, i+1, data.analisis_agua?.agua_osmotica?.[p]));
        }
        // Puntas de agua
        else if (headerText.includes('TIPO') || headerText.includes('Ø')) {
            if (data.puntas_agua) {
                Object.values(data.puntas_agua).forEach(p => {
                    if (!p || !p.tipo) return;
                    const cells = findRow(table, p.tipo);
                    if (cells) {
                        fillCell(cells, 1, p.diametro);
                        fillCell(cells, 2, p.altura);
                        fillCell(cells, 3, p.notas);
                    }
                });
            }
        }
    });

    // ===== FOTOS 3×3 (grid-item) =====
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach((item, i) => {
        if (i >= FOTO_LABELS.length) return;
        const fotoData = data.fotos?.['foto_' + i];
        if (fotoData) {
            const content = item.querySelector('.grid-item-content');
            if (content) content.innerHTML = '<img src="' + fotoData + '" style="width:100%;height:100%;object-fit:cover;">';
        }
    });
})();
