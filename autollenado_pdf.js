// Script de autollenado para los PDFs de HDM Mantenimiento
// Se ejecuta al abrir el PDF si hay datos en sessionStorage
(function(){
    const raw = sessionStorage.getItem('DatosCuestionarioHDM');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || !data.formato) return;

    // ===== FOLIO =====
    if (data.folio) {
        document.querySelectorAll('.pdf-folio-value').forEach(el => {
            el.textContent = data.folio;
        });
    }

    // Helper: encontrar fila por texto parcial en primera celda
    function findRow(tableIdx, searchTexts) {
        const tables = document.querySelectorAll('table');
        const table = tables[tableIdx];
        if (!table) return null;
        const arr = Array.isArray(searchTexts) ? searchTexts : [searchTexts];
        for (const row of table.querySelectorAll('tr')) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const text = cells[0].textContent.toUpperCase();
                if (arr.every(s => text.includes(s.toUpperCase()))) {
                    return { row, cells };
                }
            }
        }
        return null;
    }

    function fillCell(tableIdx, cellIdx, value, searchTexts) {
        if (!value || value === '—') return;
        const found = findRow(tableIdx, searchTexts);
        if (!found) return;
        const { cells } = found;
        if (cells[cellIdx]) {
            cells[cellIdx].textContent = value;
            cells[cellIdx].style.textAlign = 'center';
            cells[cellIdx].style.fontWeight = '600';
        }
    }

    // ===== DIRECCIÓN Y COLONIA =====
    document.querySelectorAll('.radios-left').forEach(rl => {
        if (rl.dataset.filled) return;
        rl.querySelectorAll('div').forEach(div => {
            const txt = div.textContent;
            if (txt.includes('Dirección:')) {
                div.innerHTML = '<input type="radio" checked> Dirección: <strong>' + (data.direccion || '—') + '</strong>';
            } else if (txt.includes('Colonia:')) {
                div.innerHTML = '<input type="radio" checked> Colonia: <strong>' + (data.colonia || '—') + '</strong>';
            }
        });
        rl.dataset.filled = '1';
    });

    // ===== FOTO UBICACIÓN (top right de cada página) =====
    if (data.foto_ubicacion) {
        document.querySelectorAll('.page').forEach(page => {
            if (page.querySelector('.foto-ubicacion-overlay')) return;
            const img = document.createElement('img');
            img.src = data.foto_ubicacion;
            img.className = 'foto-ubicacion-overlay';
            img.style.cssText = 'position:absolute;top:6mm;right:6mm;width:22mm;height:22mm;object-fit:cover;border:1.5px solid #043185;z-index:10;';
            page.appendChild(img);
        });
    }

    // ===== EMPLEADO DEL PROVEEDOR =====
    document.querySelectorAll('.provider-fields').forEach(pf => {
        if (pf.dataset.filled) return;
        const divs = pf.querySelectorAll('div');
        if (divs[0]) divs[0].innerHTML = '<input type="radio" checked> NOMBRE: <strong>' + (data.proveedor?.nombre || '—') + '</strong>';
        if (divs[1]) divs[1].innerHTML = '<input type="radio" checked> CARGO: <strong>' + (data.proveedor?.cargo || '—') + '</strong>';
        if (divs[2]) divs[2].innerHTML = '<input type="radio" checked> CELULAR: <strong>' + (data.proveedor?.celular || '—') + '</strong>';
        pf.dataset.filled = '1';
    });

    // ===== FOTO PROVEEDOR (debajo del logo) =====
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

    // ===== OBSERVACIONES =====
    if (data.observaciones) {
        document.querySelectorAll('.observations-box').forEach(ob => {
            if (ob.querySelector('.obs-text')) return;
            const t = document.createElement('div');
            t.className = 'obs-text';
            t.style.cssText = 'font-size:8px;padding:2px 4px;line-height:1.3;';
            t.textContent = data.observaciones;
            ob.appendChild(t);
        });
    }

    // ===== FOTOS DE RUBROS (por índice) =====
    const photoBoxes = document.querySelectorAll('.photo-box-captioned');
    const rubros = data.fotos_rubros || {};
    photoBoxes.forEach((box, i) => {
        const foto = rubros['rubro_' + i];
        if (foto) {
            const empty = box.querySelector('.photo-empty');
            if (empty) {
                empty.innerHTML = '<img src="' + foto + '" style="width:100%;height:100%;object-fit:cover;">';
            }
        }
    });

    // ===== FOOTER (EMPLEADO RECIBE, COMENTARIO, ESTATUS, FIRMA) =====
    document.querySelectorAll('.box-container').forEach(container => {
        if (container.dataset.filled) return;
        const header = container.querySelector('.box-header');
        const body = container.querySelector('.box-body');
        if (!header || !body) return;
        const ht = header.textContent.toUpperCase();

        if (ht.includes('EMPLEADO QUIEN RECIBE')) {
            body.innerHTML =
                '<div><input type="radio" checked> NOMBRE: <strong>' + (data.recibe?.nombre || '—') + '</strong></div>' +
                '<div><input type="radio" checked> CARGO: <strong>' + (data.recibe?.cargo || '—') + '</strong></div>' +
                '<div><input type="radio" checked> CELULAR: <strong>' + (data.recibe?.celular || '—') + '</strong></div>';
            container.dataset.filled = '1';
        } else if (ht.includes('COMENTARIO DE SALIDA')) {
            body.innerHTML = '<div style="font-size:8px;line-height:1.3;">' + (data.comentario_salida || '—') + '</div>';
            container.dataset.filled = '1';
        } else if (ht.includes('ESTATUS')) {
            const est = data.estatus === 'aceptado' ? 'ACEPTADO' : 'NO ACEPTADO';
            const col = data.estatus === 'aceptado' ? '#10b981' : '#dc2626';
            body.innerHTML = '<div style="text-align:center;font-weight:bold;color:' + col + ';font-size:11px;">' + est + '</div>';
            container.dataset.filled = '1';
        } else if (ht.includes('FIRMA') && data.firma) {
            body.innerHTML = '<img src="' + data.firma + '" style="max-width:90%;max-height:90%;object-fit:contain;">';
            body.style.display = 'flex';
            body.style.alignItems = 'center';
            body.style.justifyContent = 'center';
            container.dataset.filled = '1';
        }
    });

    // ===== TABLAS POR FORMATO =====
    const F = data.formato;
    const trat = data.equipo_tratamiento || {};
    const oi = data.equipo_osmosis || [];
    const filt = data.equipo_filtracion || {};
    const aq = data.analisis_agua || {};
    const params = ['cloro','ph','dureza','tds','alcalinidad','cloruros'];

    function fillFiltracion(ti) {
        fillCell(ti, 3, filt.f_pulidor?.remplazo, ['PULIDOR']);
        fillCell(ti, 5, filt.f_pulidor?.operacion, ['PULIDOR']);
        fillCell(ti, 3, filt.f_carbon?.remplazo, ['CARBÓN']);
        fillCell(ti, 5, filt.f_carbon?.operacion, ['CARBÓN']);
        fillCell(ti, 2, filt.lampara_uv?.energizada, ['LAMPARA']);
        fillCell(ti, 5, filt.lampara_uv?.marca, ['LAMPARA']);
    }

    function fillOsmosis(ti) {
        const labels = ['PRESIÓN ENTRADA','PRESIÓN SALIDA','PREFILTRO','MEMBRANA','ALMACENAMIENTO','BOMBA','MANOMETRO'];
        oi.forEach((row, r) => {
            const lab = labels[r];
            if (lab && row) {
                fillCell(ti, 1, row[0], [lab]);
                fillCell(ti, 3, row[1], [lab]);
                fillCell(ti, 5, row[2], [lab]);
            }
        });
    }

    function fillTanqueSalmuera(ti, t) {
        fillCell(ti, 1, t?.op, ['SALMUERA']);
        fillCell(ti, 3, t?.bypass, ['SALMUERA']);
        fillCell(ti, 5, t?.mang, ['SALMUERA']);
    }

    if (F === 1) {
        fillFiltracion(0);
        params.forEach((p, i) => {
            fillCell(1, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(1, i+1, aq.agua_filtrada?.[p], ['FILTRADA']);
        });
    } else if (F === 2) {
        // Tabla 0: Tratamiento
        const tm = trat.f_multimedia || {};
        const ts = trat.f_suavizador || {};
        [['op',1],['retro',2],['bypass',3],['ener',4],['cambios',5],['mang',6]].forEach(([k,i]) => {
            fillCell(0, i, tm[k], ['MULTIMEDIA']);
            fillCell(0, i, ts[k], ['SUAVIZADOR']);
        });
        fillTanqueSalmuera(0, trat.tanque_salmuera);
        // Tabla 1: Osmosis
        fillOsmosis(1);
        // Tabla 2: Filtración
        fillFiltracion(2);
        // Tabla 3: Análisis
        params.forEach((p, i) => {
            fillCell(3, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(3, i+1, aq.agua_filtrada?.[p], ['FILTRADA']);
            fillCell(3, i+1, aq.agua_osmotica?.[p], ['OSMOTICA']);
        });
    } else if (F === 3) {
        // Tabla 0: Tratamiento (5 rows)
        [['LECHO','f_lecho'],['ACTIVADO','f_carbon'],['MULTIMEDIA','f_multimedia'],['SUAVIZADOR','f_suavizador']].forEach(([lab, eq]) => {
            const t = trat[eq] || {};
            [['op',1],['retro',2],['bypass',3],['ener',4],['cambios',5],['mang',6]].forEach(([k,i]) => {
                fillCell(0, i, t[k], [lab]);
            });
        });
        fillTanqueSalmuera(0, trat.tanque_salmuera);
        // Tabla 1: Osmosis
        fillOsmosis(1);
        // Tabla 2: Filtración
        fillFiltracion(2);
        // Tabla 3: Análisis
        params.forEach((p, i) => {
            fillCell(3, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(3, i+1, aq.agua_suavisada?.[p], ['SUAVISADA']);
            fillCell(3, i+1, aq.agua_osmotica?.[p], ['OSMOTICA']);
        });
    } else if (F === 4) {
        // Tabla 0: Tratamiento (9 rows, estructura plana con IDs como keys)
        // Filas completas de 6 celdas
        const fullRows = [
            ['LECHO', 'trat_f_lecho_'],
            ['ACTIVADO', 'trat_f_carbon_'],
            ['MULTIMEDIA', 'trat_f_multimedia_'],
            ['SUAVIZADOR', 'trat_f_suavizador_'],
            ['DEALCALINIZADOR', 'trat_f_dealc_']
        ];
        fullRows.forEach(([lab, prefix]) => {
            [['op',1],['retro',2],['bypass',3],['ener',4],['cambios',5],['mang',6]].forEach(([k,i]) => {
                fillCell(0, i, trat[prefix + k], [lab]);
            });
        });
        // ONE CARTRIDEG SED: cells 2 (retro), 4 (ener)
        fillCell(0, 2, trat['trat_one_cart_sed_retro'], ['CARTRID', 'SED']);
        fillCell(0, 4, trat['trat_one_cart_sed_ener'], ['CARTRID', 'SED']);
        // ONE CARTRIDEG CA: cells 2 (retro), 4 (ener)
        fillCell(0, 2, trat['trat_one_cart_ca_retro'], ['CARTRID', 'CA']);
        fillCell(0, 4, trat['trat_one_cart_ca_ener'], ['CARTRID', 'CA']);
        // SCALENET: cells 1 (op), 4 (ener), 5 (cambios)
        fillCell(0, 1, trat['trat_scalenet_op'], ['SCALENET']);
        fillCell(0, 4, trat['trat_scalenet_ener'], ['SCALENET']);
        fillCell(0, 5, trat['trat_scalenet_cambios'], ['SCALENET']);
        // TANQUE SALMUERA: cells 1 (op), 3 (bypass), 5 (mang)
        fillCell(0, 1, trat['trat_tanque_salmuera_op'], ['SALMUERA']);
        fillCell(0, 3, trat['trat_tanque_salmuera_bypass'], ['SALMUERA']);
        fillCell(0, 5, trat['trat_tanque_salmuera_mang'], ['SALMUERA']);
        // Tabla 1: Osmosis
        fillOsmosis(1);
        // Tabla 2: Filtración
        fillFiltracion(2);
        // Tabla 3: Análisis
        params.forEach((p, i) => {
            fillCell(3, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(3, i+1, aq.agua_suavisada?.[p], ['SUAVISADA']);
            fillCell(3, i+1, aq.agua_osmotica?.[p], ['OSMOTICA']);
        });
    }

    // Imprimir automáticamente (opcional - descomenta si quieres auto-print)
    // setTimeout(() => window.print(), 1500);
})();
