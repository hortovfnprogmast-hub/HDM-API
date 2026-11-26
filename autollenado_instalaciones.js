// ====== AUTOLLENADO PDF INSTALACIONES ======
(function(){
    const raw = sessionStorage.getItem('DatosCuestionarioHDM');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || data.tipo !== 'instalaciones') return;

    // Secciones de fotos (mismo orden que el cuestionario)
    const PHOTO_SECTIONS = [
        { prefix: 'filt', count: 9 },
        { prefix: 'bomb', count: 3 },
        { prefix: 'calent', count: 3 },
        { prefix: 'inicial', count: 9 },
        { prefix: 'final', count: 9 },
        { prefix: 'linea', count: 3 },
        { prefix: 'arr', count: 12 }
    ];
    const photoOrder = [];
    PHOTO_SECTIONS.forEach(s => { for (let i = 0; i < s.count; i++) photoOrder.push(s.prefix + '_' + i); });

    // ===== FOLIO + FOTO UBICACIÓN (más ancha y alineada a la franja azul) =====
    if (data.folio) { document.querySelectorAll('.pdf-folio-value').forEach(el => { el.textContent = data.folio; }); }

    if (data.foto_ubicacion) {
        document.querySelectorAll('.page').forEach(page => {
            if (page.querySelector('.foto-ubicacion-overlay')) return;
            const img = document.createElement('img');
            img.src = data.foto_ubicacion;
            img.className = 'foto-ubicacion-overlay';
            img.style.cssText = 'position:absolute;top:8mm;right:15mm;width:30mm;height:24mm;object-fit:cover;border:1.5px solid #043185;z-index:10;';
            page.appendChild(img);
        });
    }

    // ===== ENCABEZADO IZQUIERDO: folio + nombre del sitio + dirección estructurada =====
    document.querySelectorAll('.page').forEach(page => {
        const rl = page.querySelector('.radios-left');
        const title = page.querySelector('.main-title');
        if (!rl || !title) return;
        const folioSpan = title.querySelector('.pdf-folio-value');
        if (folioSpan) {
            const folioDiv = folioSpan.parentElement;
            if (folioDiv && !folioDiv.dataset.movido) {
                folioDiv.dataset.movido = '1';
                folioDiv.style.textAlign = 'left';
                folioDiv.style.margin = '0 0 2px 0';
                rl.insertBefore(folioDiv, rl.firstChild);
            }
        }
        if (rl.dataset.locFilled) return;
        let divs = Array.from(rl.querySelectorAll('div'));
        if (divs[1] && divs[2]) {
            const sitioDiv = document.createElement('div');
            sitioDiv.innerHTML = '<input type="radio" checked> Nombre del sitio: <strong>' + (data.nombre_sitio || '—') + '</strong>';
            rl.insertBefore(sitioDiv, divs[2]);
        }
        divs = Array.from(rl.querySelectorAll('div'));
        const set = (i, label, val) => { if (divs[i]) divs[i].innerHTML = '<input type="radio" checked> ' + label + ': <strong>' + (val || '—') + '</strong>'; };
        set(3, 'Calle y número', data.calle_numero || data.direccion);
        set(4, 'Colonia', data.colonia);
        set(5, 'C.P.', data.cp);
        set(6, 'Alcaldía/Mpio', data.alcaldia);
        set(7, 'Ciudad/Edo', data.ciudad);
        rl.dataset.locFilled = '1';
    });

    // ===== EMPLEADO PROVEEDOR =====
    document.querySelectorAll('.provider-fields').forEach(pf => {
        const divs = pf.querySelectorAll('div');
        if (divs[0]) divs[0].innerHTML = '<input type="radio" checked> NOMBRE: <strong>' + (data.proveedor?.nombre || '—') + '</strong>';
        if (divs[1]) divs[1].innerHTML = '<input type="radio" checked> CARGO: <strong>' + (data.proveedor?.cargo || '—') + '</strong>';
        if (divs[2]) divs[2].innerHTML = '<input type="radio" checked> CELULAR: <strong>' + (data.proveedor?.celular || '—') + '</strong>';
    });

    // ===== FOTO PROVEEDOR (recuadro blanco junto a "EMPLEADO DEL PROVEEDOR") =====
    if (data.proveedor?.foto) {
        document.querySelectorAll('.provider-box').forEach(pb => {
            if (pb.querySelector('.foto-proveedor-overlay')) return;
            const blank = pb.querySelector('.provider-left-blank');
            if (!blank) return;
            const img = document.createElement('img');
            img.src = data.proveedor.foto;
            img.className = 'foto-proveedor-overlay';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
            blank.innerHTML = '';
            blank.appendChild(img);
        });
    }

    // ===== TABLAS: ANÁLISIS Y EQUIPOS =====
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
        // Tabla de análisis (header: "MAX. PERMISIBLES")
        if (headerText.includes('PERMISIBLES') || headerText.includes('CLORO')) {
            const params = ['cloro','ph','dureza','tds','alcalinidad','cloruros','otros'];
            const cruda = findRow(table, 'AGUA CRUDA');
            const filtrada = findRow(table, 'AGUA FILTRADA');
            const osmotica = findRow(table, 'AGUA OSM');
            if (cruda) params.forEach((p, i) => fillCell(cruda, i+1, data.analisis_agua?.agua_cruda?.[p]));
            if (filtrada) params.forEach((p, i) => fillCell(filtrada, i+1, data.analisis_agua?.agua_filtrada?.[p]));
            if (osmotica) params.forEach((p, i) => fillCell(osmotica, i+1, data.analisis_agua?.agua_osmotica?.[p]));
        }
        // Tablas de equipos (header: "EQUIPO" + "MODELO")
        else if (headerText.includes('EQUIPO') || headerText.includes('MODELO')) {
            const equipos = [...(data.equipo_filtracion||[]), ...(data.equipo_bombeo||[]), ...(data.equipo_calentador||[])];
            equipos.forEach(eq => {
                if (!eq || !eq.equipo) return;
                const cells = findRow(table, eq.equipo);
                if (cells) {
                    fillCell(cells, 1, eq.modelo);
                    fillCell(cells, 2, eq.tipo);
                    fillCell(cells, 3, eq.serie);
                    fillCell(cells, 4, eq.notas);
                }
            });
        }
    });

    // ===== FOTOS: llenar photo-boxes en orden =====
    const photoGrids = document.querySelectorAll('.photo-grid');
    let photoIdx = 0;
    photoGrids.forEach(grid => {
        const boxes = grid.querySelectorAll('.photo-box');
        boxes.forEach(box => {
            if (photoIdx >= photoOrder.length) return;
            const fotoKey = photoOrder[photoIdx];
            const fotoData = data.fotos?.[fotoKey];
            if (fotoData) {
                const empty = box.querySelector('.photo-empty');
                if (empty) empty.innerHTML = '<img src="' + fotoData + '" style="width:100%;height:100%;object-fit:cover;">';
                else box.innerHTML = '<img src="' + fotoData + '" style="width:100%;height:100%;object-fit:cover;">';
            }
            photoIdx++;
        });
    });

    // ===== OBSERVACIONES (página 4) =====
    if (data.observaciones) {
        document.querySelectorAll('.page').forEach(page => {
            page.querySelectorAll('div').forEach(div => {
                if (div.textContent.includes('OBSERVACIONES') && div.style.height === '60px') {
                    div.innerHTML = '<div style="font-size:8px;line-height:1.4;padding:2px;">' + data.observaciones + '</div>';
                }
            });
        });
    }

    // ===== FOOTER: RECIBE, COMENTARIO, ESTATUS, FIRMA =====
    document.querySelectorAll('.box-container').forEach(container => {
        const header = container.querySelector('.box-header');
        const body = container.querySelector('.box-body');
        if (!header || !body) return;
        const ht = header.textContent.toUpperCase();
        if (ht.includes('EMPLEADO QUIEN RECIBE')) {
            body.innerHTML = '<div><input type="radio" checked> NOMBRE: <strong>' + (data.recibe?.nombre || '—') + '</strong></div><div><input type="radio" checked> CARGO: <strong>' + (data.recibe?.cargo || '—') + '</strong></div><div><input type="radio" checked> CELULAR: <strong>' + (data.recibe?.celular || '—') + '</strong></div>';
        } else if (ht.includes('COMENTARIO DE SALIDA') && data.comentario_salida) {
            body.innerHTML = '<div style="font-size:8px;line-height:1.3;">' + data.comentario_salida + '</div>';
        } else if (ht.includes('ESTATUS')) {
            const ok = data.estatus === 'aceptado';
            const est = ok ? 'ACEPTADO' : 'NO ACEPTADO';
            const col = ok ? '#10b981' : '#dc2626';
            const bg = ok ? '#d1fae5' : '#fee2e2';
            body.innerHTML = '<div style="text-align:center;font-weight:bold;color:' + col + ';background:' + bg + ';font-size:11px;padding:6px 4px;border-radius:4px;">' + est + '</div>';
        } else if (ht.includes('FIRMA') && data.firma) {
            body.innerHTML = '<img src="' + data.firma + '" style="max-width:90%;max-height:90%;object-fit:contain;">';
            body.style.display = 'flex'; body.style.alignItems = 'center'; body.style.justifyContent = 'center';
        }
    });

    // ===== BOTÓN FLOTANTE "Regresar a aplicación" (cierra esta pestaña del PDF) =====
    if (!document.getElementById('hdm-regresar-style')) {
        const st = document.createElement('style');
        st.id = 'hdm-regresar-style';
        st.textContent = '@media print { #btn-regresar-app { display:none !important; } }';
        document.head.appendChild(st);
    }
    if (!document.getElementById('btn-regresar-app')) {
        const btn = document.createElement('button');
        btn.id = 'btn-regresar-app';
        btn.innerHTML = '&#8592; Regresar a aplicación';
        btn.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99999;background:#10b981;color:#fff;border:none;border-radius:30px;padding:10px 22px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
        btn.onclick = function() { try { window.close(); } catch(e) {} if (!window.closed) { try { window.history.back(); } catch(e2) {} } };
        document.body.appendChild(btn);
    }
})();
