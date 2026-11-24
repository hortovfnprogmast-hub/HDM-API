// ====== AUTOLLENADO PDF CORRECTIVO/EMERGENCIA ======
(function(){
    const raw = sessionStorage.getItem('DatosCuestionarioHDM');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || data.tipo !== 'correctivo') return;

    // ===== FOLIO =====
    if (data.folio) {
        document.querySelectorAll('.pdf-folio-value').forEach(el => { el.textContent = data.folio; });
    }

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

    // ===== DIRECCIÓN Y COLONIA (radios-left en cada página) =====
    document.querySelectorAll('.radios-left').forEach(rl => {
        rl.querySelectorAll('div').forEach(div => {
            const txt = div.textContent;
            if (txt.includes('Dirección:')) {
                div.innerHTML = '<input type="radio" checked> Dirección: <strong>' + (data.direccion || '—') + '</strong>';
            } else if (txt.includes('Colonia:')) {
                div.innerHTML = '<input type="radio" checked> Colonia: <strong>' + (data.colonia || '—') + '</strong>';
            }
        });
    });

    // ===== EMPLEADO PROVEEDOR =====
    document.querySelectorAll('.provider-fields').forEach(pf => {
        const divs = pf.querySelectorAll('div');
        if (divs[0]) divs[0].innerHTML = '<input type="radio" checked> NOMBRE: <strong>' + (data.proveedor?.nombre || '—') + '</strong>';
        if (divs[1]) divs[1].innerHTML = '<input type="radio" checked> CARGO: <strong>' + (data.proveedor?.cargo || '—') + '</strong>';
        if (divs[2]) divs[2].innerHTML = '<input type="radio" checked> CELULAR: <strong>' + (data.proveedor?.celular || '—') + '</strong>';
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

    // ===== SOPORTE FÍSICO (página 2 - div grande vacío) =====
    if (data.foto_soporte) {
        const pages = document.querySelectorAll('.page');
        if (pages[1]) {
            const soporteDiv = pages[1].querySelector('div[style*="flex-grow: 1"]');
            if (soporteDiv) {
                soporteDiv.innerHTML = '<img src="' + data.foto_soporte + '" style="width:100%;height:100%;object-fit:contain;">';
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
            const est = data.estatus === 'aceptado' ? 'ACEPTADO' : 'NO ACEPTADO';
            const col = data.estatus === 'aceptado' ? '#10b981' : '#dc2626';
            body.innerHTML = '<div style="text-align:center;font-weight:bold;color:' + col + ';font-size:11px;">' + est + '</div>';
        } else if (ht.includes('FIRMA') && data.firma) {
            body.innerHTML = '<img src="' + data.firma + '" style="max-width:90%;max-height:90%;object-fit:contain;">';
            body.style.display = 'flex';
            body.style.alignItems = 'center';
            body.style.justifyContent = 'center';
        }
    });
})();
