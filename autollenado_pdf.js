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

    // ===== FOTO UBICACIÓN (top right de cada página — más ancha y alineada a la franja azul) =====
    if (data.foto_ubicacion) {
        document.querySelectorAll('.page').forEach(page => {
            if (page.querySelector('.foto-ubicacion-overlay')) return;
            const img = document.createElement('img');
            img.src = data.foto_ubicacion;
            img.className = 'foto-ubicacion-overlay';
            // right:15mm alinea el borde derecho con la franja azul (.info-block); ancho 30mm
            img.style.cssText = 'position:absolute;top:8mm;right:15mm;width:30mm;height:24mm;object-fit:cover;border:1.5px solid #043185;z-index:10;';
            page.appendChild(img);
        });
    }

    // ===== ENCABEZADO IZQUIERDO: folio + nombre del sitio + dirección estructurada =====
    document.querySelectorAll('.page').forEach(page => {
        const rl = page.querySelector('.radios-left');
        const title = page.querySelector('.main-title');
        if (!rl || !title) return;

        // Mover el folio al inicio de la columna izquierda
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
        // Tras mover el folio: divs[0]=folio, divs[1]=recuadro azul.
        if (divs[1] && divs[2]) {
            const sitioDiv = document.createElement('div');
            sitioDiv.innerHTML = '<input type="radio" checked> Nombre del sitio: <strong>' + (data.nombre_sitio || '—') + '</strong>';
            rl.insertBefore(sitioDiv, divs[2]);
        }
        divs = Array.from(rl.querySelectorAll('div'));
        // [0]=folio, [1]=azul, [2]=sitio, [3]=calle(Dirección), [4]=colonia, [5]=CP, [6]=alcaldía, [7]=ciudad
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
        if (pf.dataset.filled) return;
        const divs = pf.querySelectorAll('div');
        if (divs[0]) divs[0].innerHTML = '<input type="radio" checked> NOMBRE: <strong>' + (data.proveedor?.nombre || '—') + '</strong>';
        if (divs[1]) divs[1].innerHTML = '<input type="radio" checked> CARGO: <strong>' + (data.proveedor?.cargo || '—') + '</strong>';
        if (divs[2]) divs[2].innerHTML = '<input type="radio" checked> CELULAR: <strong>' + (data.proveedor?.celular || '—') + '</strong>';
        pf.dataset.filled = '1';
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
            const ok = data.estatus === 'aceptado';
            const est = ok ? 'ACEPTADO' : 'NO ACEPTADO';
            const col = ok ? '#10b981' : '#dc2626';
            const bg = ok ? '#d1fae5' : '#fee2e2';
            body.innerHTML = '<div style="text-align:center;font-weight:bold;color:' + col + ';background:' + bg + ';font-size:11px;padding:6px 4px;border-radius:4px;">' + est + '</div>';
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
        const tm = trat.f_multimedia || {};
        const ts = trat.f_suavizador || {};
        [['op',1],['retro',2],['bypass',3],['ener',4],['cambios',5],['mang',6]].forEach(([k,i]) => {
            fillCell(0, i, tm[k], ['MULTIMEDIA']);
            fillCell(0, i, ts[k], ['SUAVIZADOR']);
        });
        fillTanqueSalmuera(0, trat.tanque_salmuera);
        fillOsmosis(1);
        fillFiltracion(2);
        params.forEach((p, i) => {
            fillCell(3, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(3, i+1, aq.agua_filtrada?.[p], ['FILTRADA']);
            fillCell(3, i+1, aq.agua_osmotica?.[p], ['OSMOTICA']);
        });
    } else if (F === 3) {
        [['LECHO','f_lecho'],['ACTIVADO','f_carbon'],['MULTIMEDIA','f_multimedia'],['SUAVIZADOR','f_suavizador']].forEach(([lab, eq]) => {
            const t = trat[eq] || {};
            [['op',1],['retro',2],['bypass',3],['ener',4],['cambios',5],['mang',6]].forEach(([k,i]) => {
                fillCell(0, i, t[k], [lab]);
            });
        });
        fillTanqueSalmuera(0, trat.tanque_salmuera);
        fillOsmosis(1);
        fillFiltracion(2);
        params.forEach((p, i) => {
            fillCell(3, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(3, i+1, aq.agua_suavisada?.[p], ['SUAVISADA']);
            fillCell(3, i+1, aq.agua_osmotica?.[p], ['OSMOTICA']);
        });
    } else if (F === 4) {
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
        fillCell(0, 2, trat['trat_one_cart_sed_retro'], ['CARTRID', 'SED']);
        fillCell(0, 4, trat['trat_one_cart_sed_ener'], ['CARTRID', 'SED']);
        fillCell(0, 2, trat['trat_one_cart_ca_retro'], ['CARTRID', 'CA']);
        fillCell(0, 4, trat['trat_one_cart_ca_ener'], ['CARTRID', 'CA']);
        fillCell(0, 1, trat['trat_scalenet_op'], ['SCALENET']);
        fillCell(0, 4, trat['trat_scalenet_ener'], ['SCALENET']);
        fillCell(0, 5, trat['trat_scalenet_cambios'], ['SCALENET']);
        fillCell(0, 1, trat['trat_tanque_salmuera_op'], ['SALMUERA']);
        fillCell(0, 3, trat['trat_tanque_salmuera_bypass'], ['SALMUERA']);
        fillCell(0, 5, trat['trat_tanque_salmuera_mang'], ['SALMUERA']);
        fillOsmosis(1);
        fillFiltracion(2);
        params.forEach((p, i) => {
            fillCell(3, i+1, aq.agua_cruda?.[p], ['CRUDA']);
            fillCell(3, i+1, aq.agua_suavisada?.[p], ['SUAVISADA']);
            fillCell(3, i+1, aq.agua_osmotica?.[p], ['OSMOTICA']);
        });
    }

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
        btn.onclick = function() {
            try { window.close(); } catch(e) {}
            if (!window.closed) { try { window.history.back(); } catch(e2) {} }
        };
        document.body.appendChild(btn);
    }

    // Imprimir automáticamente (opcional - descomenta si quieres auto-print)
    // setTimeout(() => window.print(), 1500);
})();
