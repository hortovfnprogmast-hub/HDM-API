/* =========================================================
   firebase-hdm.js — Integración Firebase para la App HDM
   ---------------------------------------------------------
   - Carga dinámica del SDK Firebase (compat, CDN) — no requiere build.
   - Inicializa Firestore + Storage con la config del proyecto.
   - Folios automáticos secuenciales por tipo (atómicos vía transacción).
   - Subida de fotos/firma (base64) a Storage → URL pública.
   - CRUD de reportes en la colección `reportes_hdm`.
   - Control de estado admin: pendiente / aceptado / rechazado.

   Reglas (definidas en la consola Firebase del proyecto):
     Firestore: allow read, write: if true;
     Storage:   allow read, write: if true;
   ========================================================= */
(function () {
    'use strict';

    // ---- Configuración del proyecto Firebase ----
    const firebaseConfig = {
        apiKey: "AIzaSyDKsKNaFpZ63AD7HniM_KDEnxVheG_txGU",
        authDomain: "hdm-api-9c96d.firebaseapp.com",
        projectId: "hdm-api-9c96d",
        storageBucket: "hdm-api-9c96d.firebasestorage.app",
        messagingSenderId: "1077189014109",
        appId: "1:1077189014109:web:90cfa7996321ef1ad093b4",
        measurementId: "G-7E23SBXTN9"
    };

    const FB_VERSION = '10.12.4';
    const CDN = 'https://www.gstatic.com/firebasejs/' + FB_VERSION;
    const COLECCION = 'reportes_hdm';   // colección principal de reportes
    const COUNTERS = 'folios';          // subcolección de contadores por tipo

    // ---- Prefijos de folio por tipo ----
    const FOLIO_PREFIX = {
        correctivo: 'CORR',
        instalaciones: 'INST',
        reporte_visitas: 'REPV',
        mantenimiento_1: 'MANT1',
        mantenimiento_2: 'MANT2',
        mantenimiento_3: 'MANT3',
        mantenimiento_4: 'MANT4'
    };

    // ---- Carga dinámica de scripts compat ----
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            const existing = document.querySelector('script[src="' + src + '"]');
            if (existing) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = function () { reject(new Error('No se pudo cargar ' + src)); };
            document.head.appendChild(s);
        });
    }

    // Normaliza timestamps de Firestore a string ISO
    function normalizeReport(r) {
        const out = Object.assign({}, r);
        const ts = r.fechaCreacion || r.fecha_creacion;
        if (ts && typeof ts.toDate === 'function') {
            out.fecha_creacion = ts.toDate().toISOString();
        } else if (r.fechaCreacion && typeof r.fechaCreacion === 'string') {
            out.fecha_creacion = r.fechaCreacion;
        } else if (typeof ts === 'string') {
            out.fecha_creacion = ts;
        } else {
            out.fecha_creacion = out.fecha_creacion || '';
        }
        // compatibilidad: exponer data si vino anidada
        if (!out.data && out.datos) out.data = out.datos;
        return out;
    }

    // ---- Objeto principal (se expondrá como window.HDM_Firebase) ----
    const HDM_Firebase = {
        _initialized: false,
        _error: null,
        _db: null,
        _storage: null,

        // Promesa que resuelve cuando Firebase está listo
        ready: null,

        isReady: function () { return this._initialized; },
        getPrefix: function (tipo) { return FOLIO_PREFIX[tipo] || 'HDM'; },
        getFolioPrefixes: function () { return Object.assign({}, FOLIO_PREFIX); },

        // ====== FOLIO AUTOMÁTICO (atómico en Firestore, fallback local) ======
        async generarFolio(tipo) {
            try {
                await this.ready;
                if (!this._initialized) throw new Error('Firebase no inicializado');
                const prefix = this.getPrefix(tipo);
                const ref = this._db.collection(COUNTERS).doc(tipo);
                const numero = await this._db.runTransaction(async (tx) => {
                    const doc = await tx.get(ref);
                    const current = (doc.exists && doc.data().contador) ? doc.data().contador : 0;
                    const next = current + 1;
                    tx.set(ref, {
                        contador: next,
                        tipo: tipo,
                        prefix: prefix,
                        actualizado: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    return next;
                });
                return prefix + '-' + String(numero).padStart(4, '0');
            } catch (e) {
                console.warn('[HDM Firebase] Folio en modo local (fallback):', e.message);
                const key = 'hdm_folio_counter_' + tipo;
                const n = (parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1;
                localStorage.setItem(key, String(n));
                // Sufijo 'L' indica folio local (sin sincronizar)
                return this.getPrefix(tipo) + '-L' + String(n).padStart(4, '0');
            }
        },

        // ====== SUBIDA DE FOTOS A STORAGE ======
        async subirFoto(tipo, folio, nombre, base64) {
            if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) return base64;
            await this.ready;
            const safeFolio = (folio || 'sf').replace(/[^a-zA-Z0-9_-]/g, '');
            const safeTipo = (tipo || 'x').replace(/[^a-zA-Z0-9_-]/g, '');
            const safeNombre = (nombre || 'foto').replace(/[^a-zA-Z0-9_-]/g, '');
            const path = 'reportes/' + safeTipo + '/' + safeFolio + '/' + safeNombre + '.jpg';
            const ref = this._storage.ref(path);
            const resp = await fetch(base64);
            const blob = await resp.blob();
            await ref.put(blob);
            return await ref.getDownloadURL();
        },

        // Recorre un objeto de datos subiendo todo base64 (fotos/firma) y reemplaza por URL
        async subirFotosDeDatos(tipo, folio, datos) {
            const self = this;
            const tareas = [];
            function recorrer(obj, ruta) {
                Object.keys(obj).forEach(function (k) {
                    const v = obj[k];
                    if (typeof v === 'string' && v.startsWith('data:image')) {
                        tareas.push(
                            self.subirFoto(tipo, folio, ruta + '_' + k, v)
                                .then(function (url) { obj[k] = url; })
                                .catch(function (e) { console.warn('[HDM Firebase] Foto no subida:', ruta + '_' + k, e.message); obj[k] = null; })
                        );
                    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
                        recorrer(v, ruta + '_' + k);
                    } else if (Array.isArray(v)) {
                        v.forEach(function (item, i) {
                            if (typeof item === 'string' && item.startsWith('data:image')) {
                                tareas.push(
                                    self.subirFoto(tipo, folio, ruta + '_' + k + '_' + i, item)
                                        .then(function (url) { v[i] = url; })
                                        .catch(function () { v[i] = null; })
                                );
                            }
                        });
                    }
                });
            }
            recorrer(datos, 'foto');
            await Promise.all(tareas);
            return datos;
        },

        // ====== GUARDAR / ACTUALIZAR REPORTE EN FIRESTORE ======
        async guardarReporte(reporte) {
            await this.ready;
            if (!this._initialized) throw new Error('Firebase no inicializado');
            const ahora = firebase.firestore.FieldValue.serverTimestamp();
            const payload = {
                folio: reporte.folio || '',
                tipo: reporte.tipo || 'desconocido',
                estado: reporte.estado || 'Borrador',            // Borrador | Realizado
                estadoControl: reporte.estadoControl || 'pendiente', // pendiente | aceptado | rechazado
                usuario: reporte.usuario || '',
                usuario_nombre: reporte.usuario_nombre || '',
                usuario_cargo: reporte.usuario_cargo || '',
                direccion: reporte.direccion || '',
                sucursal: reporte.sucursal || '',
                data: reporte.data || {},
                fechaActualizacion: ahora
            };
            if (reporte.id) {
                await this._db.collection(COLECCION).doc(reporte.id).set(payload, { merge: true });
                return reporte.id;
            }
            payload.fechaCreacion = ahora;
            const docRef = await this._db.collection(COLECCION).add(payload);
            return docRef.id;
        },

        async obtenerReporte(id) {
            await this.ready;
            const doc = await this._db.collection(COLECCION).doc(id).get();
            if (!doc.exists) return null;
            return normalizeReport(Object.assign({ id: doc.id }, doc.data()));
        },

        async obtenerPorFolio(folio) {
            await this.ready;
            const snap = await this._db.collection(COLECCION).where('folio', '==', folio).limit(1).get();
            if (snap.empty) return null;
            const doc = snap.docs[0];
            return normalizeReport(Object.assign({ id: doc.id }, doc.data()));
        },

        // ====== LISTAR ======
        async listarReportes(tipo, filtros) {
            await this.ready;
            if (!this._initialized) return [];
            filtros = filtros || {};
            let q = this._db.collection(COLECCION);
            if (tipo) q = q.where('tipo', '==', tipo);
            if (filtros.estado) q = q.where('estado', '==', filtros.estado);
            if (filtros.estadoControl) q = q.where('estadoControl', '==', filtros.estadoControl);
            const snap = await q.get();
            let arr = snap.docs.map(function (d) {
                return normalizeReport(Object.assign({ id: d.id }, d.data()));
            });
            arr.sort(function (a, b) {
                return (b.fecha_creacion || '').localeCompare(a.fecha_creacion || '');
            });
            return arr;
        },

        async listarTodos(filtros) { return this.listarReportes(null, filtros); },

        // ====== ACTUALIZAR ESTADOS ======
        async actualizarEstado(id, estado) {
            await this.ready;
            await this._db.collection(COLECCION).doc(id).update({
                estado: estado,
                fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        async actualizarEstadoControl(id, estadoControl) {
            await this.ready;
            await this._db.collection(COLECCION).doc(id).update({
                estadoControl: estadoControl,
                fechaControl: firebase.firestore.FieldValue.serverTimestamp(),
                fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        async eliminar(id) {
            await this.ready;
            await this._db.collection(COLECCION).doc(id).delete();
        },

        async contar(tipo, estado) {
            await this.ready;
            if (!this._initialized) return 0;
            let q = this._db.collection(COLECCION);
            if (tipo) q = q.where('tipo', '==', tipo);
            if (estado) q = q.where('estado', '==', estado);
            const snap = await q.get();
            return snap.size;
        }
    };

    // ---- Inicialización (carga SDK compat → init app) ----
    HDM_Firebase.ready = loadScript(CDN + '/firebase-app-compat.js')
        .then(function () {
            return Promise.all([
                loadScript(CDN + '/firebase-firestore-compat.js'),
                loadScript(CDN + '/firebase-storage-compat.js')
            ]);
        })
        .then(function () {
            firebase.initializeApp(firebaseConfig);
            HDM_Firebase._db = firebase.firestore();
            HDM_Firebase._storage = firebase.storage();
            HDM_Firebase._initialized = true;
            console.log('[HDM Firebase] Inicializado correctamente.');
        })
        .catch(function (e) {
            HDM_Firebase._error = e.message;
            console.error('[HDM Firebase] Error de inicialización:', e.message);
        });

    // ---- Exposición global ----
    window.HDM_Firebase = HDM_Firebase;
    window.HDM_FOLIO_PREFIX = FOLIO_PREFIX;
})();
