// ====== AUTOLLENADO PDF CORRECTIVO/EMERGENCIA ======
(function(){
    const raw = sessionStorage.getItem('DatosCuestionarioHDM');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || data.tipo !== 'correctivo') return;

    // ===== FOLIO (al lado izquierdo) =====
    if (data.folio) {
        document.querySelectorAll('.pdf-folio-value').forEach(el => { el.textContent = data.folio; });
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
    // Por página: mueve el folio al inicio de la columna izquierda (.radios-left) y reestructura
    // las filas de dirección: Nombre del sitio, Calle y número, Colonia, C.P., Alcaldía/Mpio, Ciudad/Edo.
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
        // Insertar "Nombre del sitio" después del recuadro azul.
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

    // ===== AREA / SUB AREA (en cada página) =====
    document.querySelectorAll('.page').forEach(page => {
        page.querySelectorAll('span').forEach(span => {
            const txt = span.textContent;
            if (txt.includes('AREA:') && !txt.includes('SUB')) {
                if (data.area) span.textContent = 'AREA: ' + data.area;
            } else if (txt.includes('SUB AREA:')) {
                if (data.sub_area) span.textContent = 'SUB AREA: ' + data.sub_area;
            }
        });
    });

    // ===== FOTOS: FALLA, TRABAJO DURANTE, TRABAJO REALIZADO =====
    const photoGrids = document.querySelectorAll('.photo-grid');
    const fallaFotos = data.fotos_falla || [];
    const duranteFotos = data.fotos_trabajo_durante || [];
    const realizadoFotos = data.fotos_trabajo_realizado || [];

    function fillPhotoGrid(gridIdx, fotosArr) {
        const grid = photoGrids[gridIdx];
        if (!grid) return;
        const boxes = grid.querySelectorAll('.photo-box');
        boxes.forEach((box, i) => {
            if (fotosArr[i]) {
                box.innerHTML = '<img src="' + fotosArr[i] + '" style="width:100%;height:100%;object-fit:cover;">';
            }
        });
    }

    if (photoGrids.length >= 3) {
        fillPhotoGrid(0, fallaFotos);      // FALLA
        fillPhotoGrid(1, duranteFotos);    // TRABAJO DURANTE
        fillPhotoGrid(2, realizadoFotos);  // TRABAJO REALIZADO
    }

    // ===== TEXT BOXES: DESCRIPCIÓN FALLA, DESCRIPCIÓN TRABAJO =====
    const textBoxes = document.querySelectorAll('.text-box');
    if (textBoxes[0] && data.descripcion_falla) {
        textBoxes[0].innerHTML = '<div style="font-size:8px;line-height:1.4;padding:2px;">' + data.descripcion_falla + '</div>';
    }
    if (textBoxes[1] && data.descripcion_trabajo) {
        textBoxes[1].innerHTML = '<div style="font-size:8px;line-height:1.4;padding:2px;">' + data.descripcion_trabajo + '</div>';
    }

    // ===== SOPORTE FÍSICO (página 2 - div grande vacío; sin desbordar la hoja) =====
    if (data.foto_soporte) {
        const pages = document.querySelectorAll('.page');
        if (pages[1]) {
            const soporteDiv = pages[1].querySelector('div[style*="flex-grow: 1"]');
            if (soporteDiv) {
                soporteDiv.style.minHeight = '0';
                soporteDiv.style.overflow = 'hidden';
                soporteDiv.style.display = 'flex';
                soporteDiv.style.alignItems = 'center';
                soporteDiv.style.justifyContent = 'center';
                soporteDiv.innerHTML = '<img src="' + data.foto_soporte + '" style="max-width:100%;max-height:100%;object-fit:contain;display:block;">';
                soporteDiv.style.padding = '0';
            }
        }
    }

    // ===== FOOTER: RECIBE, COMENTARIO, ESTATUS, FIRMA =====
    document.querySelectorAll('.box-container').forEach(container => {
        const header = container.querySelector('.box-header');
        const body = container.querySelector('.box-body');
        if (!header || !body) return;
        const ht = header.textContent.toUpperCase();

        if (ht.includes('EMPLEADO QUIEN RECIBE')) {
            body.innerHTML =
                '<div><input type="radio" checked> NOMBRE: <strong>' + (data.recibe?.nombre || '—') + '</strong></div>' +
                '<div><input type="radio" checked> CARGO: <strong>' + (data.recibe?.cargo || '—') + '</strong></div>' +
                '<div><input type="radio" checked> CELULAR: <strong>' + (data.recibe?.celular || '—') + '</strong></div>';
        } else if (ht.includes('COMENTARIO DE SALIDA')) {
            if (data.comentario_salida) {
                body.innerHTML = '<div style="font-size:8px;line-height:1.3;">' + data.comentario_salida + '</div>';
            }
        } else if (ht.includes('ESTATUS')) {
            const ok = data.estatus === 'aceptado';
            const est = ok ? 'ACEPTADO' : 'NO ACEPTADO';
            const col = ok ? '#10b981' : '#dc2626';
            const bg = ok ? '#d1fae5' : '#fee2e2';
            body.innerHTML = '<div style="text-align:center;font-weight:bold;color:' + col + ';background:' + bg + ';font-size:11px;padding:6px 4px;border-radius:4px;">' + est + '</div>';
        } else if (ht.includes('FIRMA') && data.firma) {
            body.innerHTML = '<img src="' + data.firma + '" style="max-width:90%;max-height:90%;object-fit:contain;">';
            body.style.display = 'flex';
            body.style.alignItems = 'center';
            body.style.justifyContent = 'center';
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
        btn.onclick = function() {
            try { window.close(); } catch(e) {}
            if (!window.closed) { try { window.history.back(); } catch(e2) {} }
        };
        document.body.appendChild(btn);
    }
})();
