/* ==========================================================
   HOTEL AGUAJE · lógica
   Lee CONFIG (js/config.js) y arma la página.
   No hace falta editar este archivo para personalizar.
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const soles = (n) => "S/ " + n.toFixed(2);
  const solesCorto = (n) => "S/ " + (Number.isInteger(n) ? n : n.toFixed(2));
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = document.documentElement;

  /* ---------- Fechas (todas como "AAAA-MM-DD", hora de Perú) ---------- */
  const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const horaLima = () => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", hour: "numeric", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const v = (t) => Number(p.find((x) => x.type === t).value);
    return { h: v("hour"), m: v("minute") };
  };
  const sumarDias = (f, n) => {
    const [y, m, d] = f.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  };
  const diaSemana = (f) => new Date(f + "T12:00:00Z").getUTCDay();
  const fmtFecha = (f, conAnio = true) => new Intl.DateTimeFormat("es-PE", {
    weekday: "short", day: "numeric", month: "short", ...(conAnio ? { year: "numeric" } : {}), timeZone: "UTC",
  }).format(new Date(f + "T12:00:00Z")).replace(/\./g, "");
  const fmtCorta = (f) => new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" })
    .format(new Date(f + "T12:00:00Z")).replace(/\./g, "");
  const fmtHora = (h, m = 0) => {
    if (typeof h === "string") [h, m] = h.split(":").map(Number);
    return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "a. m." : "p. m."}`;
  };
  const listaNoches = (desde = estado.llegada, hasta = estado.salida) => {
    const out = [];
    for (let f = desde; f < hasta; f = sumarDias(f, 1)) out.push(f);
    return out;
  };

  /* ---------- Estado + memoria del navegador ---------- */
  const CLAVE = "reserva-" + CONFIG.nombre;
  const hoy = hoyLima();
  const habPorId = (id) => CONFIG.habitaciones.find((h) => h.id === id);
  const destacada = CONFIG.habitaciones.find((h) => h.etiqueta) || CONFIG.habitaciones[0];
  const estado = {
    llegada: sumarDias(hoy, 1),
    salida: sumarDias(hoy, 3),
    huespedes: 2,
    reserva: new Map(),     // id de habitación → cantidad
    extras: new Set(),
    almohada: "",
    vista: destacada.id,    // puerta abierta en el pasillo
  };
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (g) {
      if (g.llegada >= hoy && g.salida > g.llegada) { estado.llegada = g.llegada; estado.salida = g.salida; }
      if (g.huespedes) estado.huespedes = g.huespedes;
      (g.reserva || []).forEach(([id, n]) => { if (habPorId(id)) estado.reserva.set(id, n); });
      (g.extras || []).forEach((id) => { if (CONFIG.extras.some((e) => e.id === id)) estado.extras.add(id); });
      if (CONFIG.almohadas.some((a) => a.id === g.almohada)) estado.almohada = g.almohada;
    }
  } catch (_) { /* sin memoria: se usa el estado por defecto */ }
  const guardar = () => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        llegada: estado.llegada, salida: estado.salida, huespedes: estado.huespedes,
        reserva: [...estado.reserva], extras: [...estado.extras], almohada: estado.almohada,
      }));
    } catch (_) { /* modo privado o almacenamiento bloqueado */ }
  };

  /* ---------- Precios ---------- */
  const temporadaDe = (f) => CONFIG.temporadas.find((t) => f >= t.desde && f <= t.hasta);
  function precioNoche(hab, f) {
    const finde = [5, 6].includes(diaSemana(f));            // noches de viernes y sábado
    let p = finde && hab.precioFinde ? hab.precioFinde : hab.precio;
    const t = temporadaDe(f);
    if (t) p = Math.round(p * (1 + t.recargo / 100));
    return p;
  }
  const precioEstadia = (hab, noches = listaNoches()) => noches.reduce((s, f) => s + precioNoche(hab, f), 0);
  const descuentoEstadia = (n) => CONFIG.estadias
    .filter((e) => n >= e.minNoches)
    .sort((a, b) => b.porcentaje - a.porcentaje)[0] || null;
  const conDescuento = (total, n) => {
    const d = descuentoEstadia(n);
    return d ? total * (1 - d.porcentaje / 100) : total;
  };

  function precioExtra(ex, noches) {
    if (ex.gratisDesdeNoches && noches >= ex.gratisDesdeNoches) return 0;
    if (ex.cobro === "noche") return ex.precio * noches;
    if (ex.cobro === "personaNoche") return ex.precio * noches * estado.huespedes;
    return ex.precio;
  }

  function calcular() {
    const noches = listaNoches().length;
    const lineas = [...estado.reserva].map(([id, n]) => {
      const hab = habPorId(id);
      return { hab, n, total: precioEstadia(hab) * n };
    });
    const subtotal = lineas.reduce((s, l) => s + l.total, 0);
    const desc = descuentoEstadia(noches);
    const descMonto = desc ? Math.round(subtotal * desc.porcentaje) / 100 : 0;
    const extras = CONFIG.extras.filter((e) => estado.extras.has(e.id)).map((ex) => ({ ex, total: precioExtra(ex, noches) }));
    const extrasTotal = extras.reduce((s, e) => s + e.total, 0);
    const total = subtotal - descMonto + extrasTotal;
    const capacidad = lineas.reduce((s, l) => s + l.hab.capacidad * l.n, 0) + (estado.extras.has("cama") ? 1 : 0);
    const habitaciones = lineas.reduce((s, l) => s + l.n, 0);
    return { noches, lineas, subtotal, desc, descMonto, extras, extrasTotal, total, capacidad, habitaciones,
      adelanto: Math.round(total * CONFIG.adelanto) / 100 };
  }

  /* ---------- Textos simples ---------- */
  const [primera, ...resto] = CONFIG.nombre.split(" ");
  const nombreHTML = `${esc(primera)} <em>${esc(resto.join(" "))}</em>`;
  $$("[data-nombre]").forEach((el) => { el.innerHTML = nombreHTML; });
  $$("[data-nombre-plano]").forEach((el) => { el.textContent = CONFIG.nombre; });
  $$("[data-ciudad]").forEach((el) => { el.textContent = CONFIG.ciudad; });
  $$("[data-checkin]").forEach((el) => { el.textContent = "Entrada " + fmtHora(CONFIG.checkin); });
  $$("[data-checkout]").forEach((el) => { el.textContent = "salida " + fmtHora(CONFIG.checkout); });
  $$("[data-direccion]").forEach((el) => { el.textContent = CONFIG.direccion; });
  $$("[data-tel]").forEach((el) => { el.textContent = CONFIG.telefono; el.href = "tel:" + CONFIG.telefono.replace(/\s/g, ""); });
  $$("[data-email]").forEach((el) => { el.textContent = CONFIG.email; el.href = "mailto:" + CONFIG.email; });
  $$("[data-pagos]").forEach((el) => { el.textContent = CONFIG.pagos.join(" · ") + (CONFIG.factura ? " · Boleta y factura" : ""); });
  $("#anio").textContent = new Date().getFullYear();
  $("#convenio-texto").textContent = CONFIG.convenio;

  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || `Hola ${CONFIG.nombre} 👋, quiero consultar disponibilidad de habitaciones.`);
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Día / noche ---------- */
  const periodoReal = () => {
    const { h } = horaLima();
    return h >= 6 && h < 12 ? "dia" : h >= 12 && h < 18 ? "tarde" : "noche";
  };
  function pintarModo() {
    const modo = raiz.dataset.modo;
    const real = periodoReal();
    const modoReal = real === "noche" ? "noche" : "dia";
    const periodo = modo === modoReal ? real : modo;     // si el visitante cambió el modo, se respeta
    const p = CONFIG.portada[periodo];
    const img = $("#hero-img");
    if (img.getAttribute("src") !== p.imagen) img.src = p.imagen;
    $("#hero-saludo").textContent = CONFIG.portada[real].saludo;   // el saludo siempre sigue la hora real
    $("#hero-titulo").innerHTML = p.titulo;
    $("#hero-texto").textContent = p.texto;
    $(".footer__grande").textContent = modo === "noche" ? "Que descanses." : "Buen día.";
    const btn = $("#modo-btn");
    btn.innerHTML = `<i class="ph ${modo === "noche" ? "ph-sun" : "ph-moon"}" aria-hidden="true"></i>`;
    btn.setAttribute("aria-label", modo === "noche" ? "Cambiar a modo día" : "Cambiar a modo noche");
    $('meta[name="theme-color"]').content = modo === "noche" ? "#0D1020" : "#F4EFE6";
  }
  $("#modo-btn").addEventListener("click", () => {
    raiz.dataset.modo = raiz.dataset.modo === "noche" ? "dia" : "noche";
    try { localStorage.setItem("modo-hotel", raiz.dataset.modo); } catch (_) { /* sin memoria */ }
    pintarModo();
  });

  function pintarReloj() {
    const { h, m } = horaLima();
    const hora = fmtHora(h, m).replace(/^(\d+) /, "$1:00 ");
    $("#reloj").textContent = "Recepción · " + hora;
    $("#hero-hora").textContent = hora;
  }
  pintarReloj();
  setInterval(pintarReloj, 30000);

  /* ---------- Header ---------- */
  const nav = $("#nav"), menuBtn = $("#menu-btn");
  const cerrarMenu = () => {
    nav.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
  };
  menuBtn.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", abierto);
    menuBtn.innerHTML = `<i class="ph ${abierto ? "ph-x" : "ph-list"}" aria-hidden="true"></i>`;
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", cerrarMenu));

  /* ---------- Sellos de calificación ---------- */
  const sellos = CONFIG.ratings.map((r) => `
    <div class="sello" role="img" aria-label="${r.valor} de ${r.max} en ${esc(r.fuente)}, ${r.total} reseñas">
      <strong>${r.valor}</strong><small>${esc(r.fuente)}</small><small>${r.total} reseñas</small>
    </div>`).join("");
  $("#hero-sellos").innerHTML = sellos;
  $("#sellos").innerHTML = sellos;

  /* ---------- Selects ---------- */
  const opcionesHuespedes = Array.from({ length: 8 }, (_, i) => `<option value="${i + 1}">${plural(i + 1, "huésped", "huéspedes")}</option>`).join("");
  ["#f-huespedes", "#d-huespedes"].forEach((s) => { $(s).innerHTML = opcionesHuespedes; });
  $("#c-pago").innerHTML = CONFIG.pagos.filter((p) => p !== "Efectivo").map((p) => `<option>${esc(p)}</option>`).join("");
  if (!CONFIG.factura) $("#c-factura-wrap").hidden = true;

  /* ---------- Fechas: tarjeta de la portada y check-in sincronizados ---------- */
  const campos = { llegada: ["#f-llegada", "#d-llegada"], salida: ["#f-salida", "#d-salida"], huespedes: ["#f-huespedes", "#d-huespedes"] };
  function pintarFechas() {
    Object.entries(campos).forEach(([k, sels]) => sels.forEach((s) => { $(s).value = estado[k]; }));
    campos.llegada.forEach((s) => { $(s).min = hoy; });
    campos.salida.forEach((s) => { $(s).min = sumarDias(estado.llegada, 1); });
  }
  function cambiarFecha(campo, valor) {
    if (campo === "llegada") {
      if (!valor || valor < hoy) valor = hoy;
      const n = listaNoches().length || 1;
      estado.llegada = valor;
      if (estado.salida <= valor) estado.salida = sumarDias(valor, n);
    } else if (campo === "salida") {
      estado.salida = valor && valor > estado.llegada ? valor : sumarDias(estado.llegada, 1);
    } else {
      estado.huespedes = Number(valor) || 1;
    }
    guardar();
    actualizarTodo();
  }
  Object.entries(campos).forEach(([k, sels]) => sels.forEach((s) => {
    $(s).addEventListener("change", (e) => cambiarFecha(k, e.target.value));
  }));
  $("#buscador").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#habitaciones").scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
  });
  const textoEstadia = (conAnio = false) =>
    `${plural(listaNoches().length, "noche", "noches")} · ${fmtFecha(estado.llegada, conAnio)} → ${fmtFecha(estado.salida, conAnio)}`;

  /* ---------- 01 · 24 horas en el hotel ---------- */
  $("#momentos").innerHTML = CONFIG.dia.map((m, i) => `
    <li class="momento ${i ? "" : "activo"}" data-i="${i}">
      <p class="momento__hora mono"><i class="ph ${esc(m.icono)}" aria-hidden="true"></i>${esc(fmtHora(m.hora))}</p>
      <h3>${esc(m.titulo)}</h3>
      <p>${esc(m.texto)}</p>
    </li>`).join("");
  $("#cielo-fotos").innerHTML = CONFIG.dia.map((m, i) =>
    `<img src="${esc(m.imagen)}" alt="" class="${i ? "" : "activa"}" ${i > 1 ? 'loading="lazy"' : ""} data-fallback="images/habitaciones/instalacion.svg">`).join("");
  $("#incluido").innerHTML = CONFIG.incluido.map((s) => `<li><i class="ph ${esc(s.icono)}" aria-hidden="true"></i>${esc(s.nombre)}</li>`).join("");

  // Colores del cielo según la hora
  function cieloDe(h) {
    if (h >= 6 && h < 9) return ["#F9D29D", "#F2A07B"];      // amanecer
    if (h >= 9 && h < 16) return ["#8CC8EC", "#CFE8F5"];     // día
    if (h >= 16 && h < 19) return ["#F6A65A", "#C2577A"];    // atardecer
    if (h >= 19 && h < 22) return ["#2B2D6E", "#5A3F7A"];    // anochecer
    return ["#0B1030", "#1B2152"];                            // noche
  }
  const cielo = $("#cielo"), astro = $("#cielo-astro");
  function moverCielo(i) {
    const m = CONFIG.dia[i];
    const [hh, mm] = m.hora.split(":").map(Number);
    const h = hh + mm / 60;
    const esSol = h >= 6 && h < 18;
    const t = esSol ? (h - 6) / 12 : ((h - 18 + 24) % 24) / 12;
    astro.classList.toggle("luna", !esSol);
    astro.style.left = `${50 - 50 * Math.cos(Math.PI * t)}%`;
    astro.style.top = `${100 - 100 * Math.sin(Math.PI * t)}%`;
    const [a, b] = cieloDe(hh);
    cielo.style.setProperty("--cielo-a", a);
    cielo.style.setProperty("--cielo-b", b);
    $("#cielo-hora").textContent = m.hora;
    $$("#cielo-fotos img").forEach((img, j) => img.classList.toggle("activa", j === i));
    $$(".momento").forEach((li, j) => li.classList.toggle("activo", j === i));
  }
  moverCielo(0);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) moverCielo(Number(en.target.dataset.i)); });
    }, { rootMargin: "-48% 0px -48% 0px" });
    $$(".momento").forEach((li) => io.observe(li));
  }

  /* ---------- 02 · El pasillo ---------- */
  const fallbackHab = "images/habitaciones/habitacion.svg";
  const pasillo = $("#pasillo");
  pasillo.innerHTML = CONFIG.habitaciones.map((h) => `
    <button class="puerta" type="button" role="tab" id="puerta-${h.id}" data-puerta="${h.id}" aria-controls="cuarto" aria-selected="false">
      <span class="puerta__marco">
        <img class="puerta__vista" src="${esc(h.imagenes[0])}" alt="" loading="lazy" data-fallback="${fallbackHab}">
        <span class="puerta__luz"></span>
        <span class="puerta__hoja"><span class="puerta__placa">${esc(h.numero)}</span><span class="puerta__manija"></span></span>
        <span class="puerta__colgante">Tu cuarto</span>
      </span>
      <span class="puerta__nombre">${esc(h.corto)}</span>
      <span class="puerta__precio">desde ${solesCorto(h.precio)}</span>
    </button>`).join("");

  let fotoCuarto = 0;
  function botonesCuarto(h) {
    const n = estado.reserva.get(h.id) || 0;
    if (!n) {
      return `<button class="btn btn--acento" type="button" data-agregar="${h.id}">Elegir la ${esc(h.numero)} <i class="ph ph-key" aria-hidden="true"></i></button>
        <a class="btn btn--linea" href="${waLink(`Hola ${CONFIG.nombre} 👋, tengo una consulta sobre la habitación ${h.nombre}.`)}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>`;
    }
    return `<div class="cantidad" role="group" aria-label="Cantidad de ${esc(h.corto)}">
        <button type="button" data-restar="${h.id}" aria-label="Quitar una"><i class="ph ph-minus" aria-hidden="true"></i></button>
        <span>${plural(n, "habitación", "habitaciones")}</span>
        <button type="button" data-sumar="${h.id}" aria-label="Agregar otra" ${n >= h.unidades ? "disabled" : ""}><i class="ph ph-plus" aria-hidden="true"></i></button>
      </div>
      <button class="btn btn--acento" type="button" data-abrir-checkin>Ir al check-in <i class="ph ph-arrow-right" aria-hidden="true"></i></button>`;
  }
  function pintarCuarto() {
    const h = habPorId(estado.vista);
    const noches = listaNoches();
    const total = precioEstadia(h, noches);
    const desc = descuentoEstadia(noches.length);
    const amen = h.amenidades.map((k) => CONFIG.amenidades[k]).filter(Boolean);
    $$(".puerta").forEach((p) => p.setAttribute("aria-selected", p.dataset.puerta === h.id));
    $("#cuarto").setAttribute("aria-labelledby", "puerta-" + h.id);
    $("#cuarto").innerHTML = `
      <div class="cuarto__galeria">
        <div class="cuarto__principal">
          ${h.etiqueta ? `<span class="cuarto__etiqueta mono">${esc(h.etiqueta)}</span>` : ""}
          <img src="${esc(h.imagenes[fotoCuarto] || h.imagenes[0])}" alt="${esc(h.nombre)}" data-fallback="${fallbackHab}">
        </div>
        ${h.imagenes.length > 1 ? `<div class="cuarto__miniaturas">${h.imagenes.map((src, j) => `
          <button type="button" data-foto="${j}" aria-pressed="${j === fotoCuarto}" aria-label="Foto ${j + 1}"><img src="${esc(src)}" alt="" loading="lazy" data-fallback="${fallbackHab}"></button>`).join("")}</div>` : ""}
      </div>
      <div class="cuarto__info">
        <p class="cuarto__num mono">Habitación ${esc(h.numero)} · ${plural(h.unidades, "habitación", "habitaciones")} de este tipo</p>
        <h3>${esc(h.nombre)}</h3>
        <div class="cuarto__datos">
          <span><small>Para</small>${plural(h.capacidad, "persona", "personas")}</span>
          <span><small>Camas</small>${esc(h.camas)}</span>
          <span><small>Tamaño</small>${h.m2} m²</span>
        </div>
        <p class="cuarto__desc">${esc(h.descripcion)}</p>
        <ul class="cuarto__amen">${amen.map((a) => `<li><i class="ph ${esc(a.icono)}" aria-hidden="true"></i>${esc(a.nombre)}</li>`).join("")}</ul>
        <div class="cuarto__precio">
          <span class="cuarto__precio-num">${solesCorto(h.precio)} <small>/ noche</small></span>
          <span class="cuarto__total">${esc(textoEstadia())}<strong>${soles(conDescuento(total, noches.length))}</strong>${desc ? `<span class="ok">Tarifa ${esc(desc.nombre.toLowerCase())}: -${desc.porcentaje}%</span>` : ""}</span>
        </div>
        <div class="cuarto__acciones" id="cuarto-acciones">${botonesCuarto(h)}</div>
        <details>
          <summary>Ver el precio de cada noche</summary>
          <ul>${noches.map((f) => {
            const t = temporadaDe(f), p = precioNoche(h, f);
            return `<li class="${t || p !== h.precio ? "especial" : ""}"><span>${esc(fmtFecha(f, false))}${t ? ` · ${esc(t.nombre)}` : p !== h.precio ? " · fin de semana" : ""}</span><span>${soles(p)}</span></li>`;
          }).join("")}</ul>
        </details>
      </div>`;
  }
  function abrirPuerta(id, desplazar) {
    if (estado.vista !== id) fotoCuarto = 0;
    estado.vista = id;
    pintarCuarto();
    const p = $(`#puerta-${id}`);
    if (desplazar) {
      pasillo.scrollTo({ left: p.offsetLeft - (pasillo.clientWidth - p.offsetWidth) / 2, behavior: reducido ? "auto" : "smooth" });
    }
  }
  pasillo.addEventListener("click", (e) => {
    const p = e.target.closest("[data-puerta]");
    if (p) abrirPuerta(p.dataset.puerta, true);
  });
  pasillo.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const ids = CONFIG.habitaciones.map((h) => h.id);
    const i = (ids.indexOf(estado.vista) + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length;
    abrirPuerta(ids[i], true);
    $(`#puerta-${ids[i]}`).focus();
  });
  $("#cuarto").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.foto) { fotoCuarto = Number(b.dataset.foto); pintarCuarto(); return; }
    if (b.dataset.agregar) cambiarCantidad(b.dataset.agregar, 1, "sumar");
    else if (b.dataset.sumar) cambiarCantidad(b.dataset.sumar, 1, "sumar");
    else if (b.dataset.restar) cambiarCantidad(b.dataset.restar, -1, "restar");
    else if ("abrirCheckin" in b.dataset) abrirCheckin();
  });

  function cambiarCantidad(id, delta, foco) {
    const h = habPorId(id);
    const n = Math.max(0, Math.min(h.unidades, (estado.reserva.get(id) || 0) + delta));
    if (n) estado.reserva.set(id, n); else estado.reserva.delete(id);
    guardar();
    actualizarReserva();
    if (estado.vista === id) {
      $("#cuarto-acciones").innerHTML = botonesCuarto(h);
      if (foco) requestAnimationFrame(() => ($(`#cuarto-acciones [data-${foco}]`) || $("#cuarto-acciones [data-agregar]"))?.focus());
    }
    if (delta > 0) {
      avisar(`Habitación ${h.numero} agregada a tu reserva`);
      const c = $("#contador");
      c.classList.remove("salta"); void c.offsetWidth; c.classList.add("salta");
    }
  }

  /* Brújula: recomienda una habitación con 3 respuestas */
  const brujula = $("#brujula");
  brujula.addEventListener("change", () => {
    const r = (n) => ($(`input[name="${n}"]:checked`, brujula) || {}).value;
    const quien = r("q-quien"), motivo = r("q-motivo"), precio = r("q-precio");
    if (!quien) { $("#brujula-resultado").textContent = "Empieza por decirnos con quién viajas."; return; }
    let opciones = CONFIG.habitaciones.filter((h) =>
      quien === "solo" ? h.capacidad <= 2 : quien === "pareja" ? h.capacidad === 2 : h.capacidad >= 3);
    if (quien === "solo" && motivo !== "descanso") opciones = opciones.filter((h) => h.capacidad === 1).concat(opciones.filter((h) => h.capacidad !== 1));
    const puntaje = (h) => {
      let s = 0;
      if (motivo === "trabajo" && h.amenidades.includes("escritorio")) s += 1000;
      if (motivo === "descanso") s += ["ducha", "hervidor", "sofa", "blackout"].filter((k) => h.amenidades.includes(k)).length * 300;
      if (quien === "solo" && h.capacidad === 1) s += motivo === "descanso" ? 0 : 500;
      if (precio === "ahorro") s -= h.precio * 3;
      if (precio === "gusto") s += h.precio * 3;
      return s;
    };
    const elegida = opciones.sort((a, b) => puntaje(b) - puntaje(a))[0] || destacada;
    $$(".puerta").forEach((p) => p.classList.toggle("recomendada", p.dataset.puerta === elegida.id));
    $("#brujula-resultado").innerHTML = `Te recomendamos la <strong>${esc(elegida.numero)} · ${esc(elegida.nombre)}</strong> (${solesCorto(elegida.precio)} la noche). Ya te abrimos la puerta.`;
    abrirPuerta(elegida.id, true);
  });

  /* ---------- 03 · Carta de almohadas ---------- */
  function pintarAlmohadas() {
    $("#carta").innerHTML = CONFIG.almohadas.map((a) => `
      <button class="almohada" type="button" role="radio" aria-checked="${estado.almohada === a.id}" data-almohada="${a.id}">
        <i class="ph ${esc(a.icono)}" aria-hidden="true"></i>
        <strong>${esc(a.nombre)}</strong>
        <small>${esc(a.detalle)}</small>
      </button>`).join("");
    $("#d-almohada").innerHTML = `<button type="button" role="radio" aria-checked="${!estado.almohada}" data-almohada="">La que tengan</button>` +
      CONFIG.almohadas.map((a) => `<button type="button" role="radio" aria-checked="${estado.almohada === a.id}" data-almohada="${a.id}">${esc(a.nombre)}</button>`).join("");
  }
  $("#kit").innerHTML = `<strong>Kit de descanso incluido:</strong> ${CONFIG.kitDescanso.map(esc).join(" · ")}`;
  function elegirAlmohada(id, foco) {
    estado.almohada = estado.almohada === id && foco === "carta" ? "" : id;
    guardar();
    pintarAlmohadas();
    pintarTarjeta();
    const a = CONFIG.almohadas.find((x) => x.id === estado.almohada);
    if (foco === "carta") {
      $(`#carta [data-almohada="${id}"]`)?.focus();
      avisar(a ? `Almohada ${a.nombre.toLowerCase()} anotada para tu reserva` : "Quitamos la almohada elegida", a ? "ph-check-circle" : "ph-info");
    } else $(`#d-almohada [data-almohada="${id}"]`)?.focus();
  }
  $("#carta").addEventListener("click", (e) => {
    const b = e.target.closest("[data-almohada]");
    if (b) elegirAlmohada(b.dataset.almohada, "carta");
  });
  $("#d-almohada").addEventListener("click", (e) => {
    const b = e.target.closest("[data-almohada]");
    if (b) elegirAlmohada(b.dataset.almohada, "checkin");
  });

  /* ---------- 04 · Calculadora y recibos ---------- */
  const calcHab = $("#calc-hab"), calcN = $("#calc-noches");
  calcHab.innerHTML = CONFIG.habitaciones.map((h) => `<option value="${h.id}" ${h.id === destacada.id ? "selected" : ""}>${esc(h.numero)} · ${esc(h.nombre)}</option>`).join("");
  const maxN = Number(calcN.max);
  const posTramo = (n) => ((n - 1) / (maxN - 1)) * 100;
  $("#calc-tramos").innerHTML = [{ nombre: "Por noche", minNoches: 1, porcentaje: 0 }, ...CONFIG.estadias].map((e) =>
    `<span style="left:${posTramo(e.minNoches)}%" data-min="${e.minNoches}">${e.porcentaje ? `-${e.porcentaje}%` : "Normal"}</span>`).join("");

  function pintarCalculadora() {
    const h = habPorId(calcHab.value);
    const n = Number(calcN.value);
    const noches = listaNoches(estado.llegada, sumarDias(estado.llegada, n));
    const lista = precioEstadia(h, noches);
    const desc = descuentoEstadia(n);
    const descMonto = desc ? Math.round(lista * desc.porcentaje) / 100 : 0;
    const directo = lista - descMonto;
    const apps = (h.precioApps || h.precio) * n;
    const ahorro = apps - directo;
    $("#calc-n").textContent = n;
    $$("#calc-tramos span").forEach((s) => s.classList.toggle("activo", desc ? Number(s.dataset.min) === desc.minNoches : s.dataset.min === "1"));
    const siguiente = CONFIG.estadias.filter((e) => e.minNoches > n).sort((a, b) => a.minNoches - b.minNoches)[0];
    $("#calc-nota").innerHTML = [
      desc ? `<strong>Tarifa ${esc(desc.nombre.toLowerCase())} aplicada: -${desc.porcentaje}%</strong> en tu habitación.` : "Tarifa normal por noche.",
      siguiente ? ` Con ${plural(siguiente.minNoches - n, "noche", "noches")} más, pasas a la tarifa ${esc(siguiente.nombre.toLowerCase())} (-${siguiente.porcentaje}%).` : "",
    ].join("");
    $("#recibos").innerHTML = `
      <div class="recibo recibo--apps">
        <h3>App de reservas</h3>
        <p class="recibo__sub">${esc(h.nombre)}</p>
        <div class="recibo__fila"><span>${n} × ${solesCorto(h.precioApps || h.precio)}</span><span>${soles(apps)}</span></div>
        <div class="recibo__fila mas"><span>Comisión incluida</span><span>~${CONFIG.comisionApps}%</span></div>
        <div class="recibo__fila"><span>Almohada a elección</span><span>—</span></div>
        <div class="recibo__fila"><span>Descuento estadía</span><span>—</span></div>
        <div class="recibo__total"><span>Total</span><span>${soles(apps)}</span></div>
      </div>
      <div class="recibo recibo--directo">
        <h3>Directo · ${esc(CONFIG.nombre)}</h3>
        <p class="recibo__sub">${esc(h.nombre)} · hab. ${esc(h.numero)}</p>
        <div class="recibo__fila"><span>${plural(n, "noche", "noches")}</span><span>${soles(lista)}</span></div>
        ${desc ? `<div class="recibo__fila menos"><span>${esc(desc.nombre)} -${desc.porcentaje}%</span><span>-${soles(descMonto)}</span></div>` : ""}
        <div class="recibo__fila"><span>Desayuno buffet</span><span>incluido</span></div>
        <div class="recibo__fila"><span>Almohada a elección</span><span>S/ 0.00</span></div>
        <div class="recibo__total"><span>Total</span><span>${soles(directo)}</span></div>
        ${ahorro > 0 ? `<div class="recibo__sello">Ahorras<strong>${soles(ahorro)}</strong></div>` : ""}
      </div>
      <button class="btn btn--acento btn--full" type="button" id="calc-reservar" style="grid-column:1/-1;margin-top:40px">Reservar ${plural(n, "noche", "noches")} desde el ${esc(fmtFecha(estado.llegada, false))} <i class="ph ph-arrow-right" aria-hidden="true"></i></button>`;
  }
  calcHab.addEventListener("change", pintarCalculadora);
  calcN.addEventListener("input", pintarCalculadora);
  $("#recibos").addEventListener("click", (e) => {
    if (!e.target.closest("#calc-reservar")) return;
    estado.salida = sumarDias(estado.llegada, Number(calcN.value));
    if (!estado.reserva.has(calcHab.value)) estado.reserva.set(calcHab.value, 1);
    guardar();
    actualizarTodo();
    abrirCheckin();
  });

  /* ---------- 05 · Libro de visitas, reglas, preguntas ---------- */
  $("#libro").innerHTML = CONFIG.testimonios.map((t) => `
    <figure class="nota">
      <blockquote>${esc(t.texto)}</blockquote>
      <figcaption>
        <strong>${esc(t.nombre)}</strong>
        <span><span class="nota__estrellas" aria-label="${t.estrellas} de 5 estrellas">${"★".repeat(t.estrellas)}${"☆".repeat(5 - t.estrellas)}</span><br>
        Hab. ${esc(t.habitacion)} · ${plural(t.noches, "noche", "noches")} · ${esc(t.pais)} · ${esc(t.fuente)}</span>
      </figcaption>
    </figure>`).join("");
  $("#reglas-lista").innerHTML = CONFIG.politicas.map((p) => `<li><strong>${esc(p.titulo)}</strong><p>${esc(p.texto)}</p></li>`).join("");
  $("#faq").innerHTML = CONFIG.preguntas.map((q) => `
    <details><summary>${esc(q.p)}<i class="ph ph-plus" aria-hidden="true"></i></summary><p>${esc(q.r)}</p></details>`).join("");

  /* ---------- 06 · Recepción: el timbre ---------- */
  function tilin() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      [2093, 3136].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(i ? .05 : .12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + 1.4);
        o.connect(g).connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 1.4);
      });
    } catch (_) { /* sin audio: no pasa nada */ }
  }
  $("#timbre").addEventListener("click", (e) => {
    const t = e.currentTarget;
    t.classList.remove("sonando"); void t.offsetWidth; t.classList.add("sonando");
    tilin();
    window.open(waLink(`Hola ${CONFIG.nombre} 👋, tengo una consulta para recepción.`), "_blank", "noopener");
  });

  /* ---------- Mapa, redes, SEO ---------- */
  const { lat, lng } = CONFIG.ubicacion;
  $("#mapa").src = `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  $("#como-llegar").href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const iconosRedes = { facebook: "ph-facebook-logo", instagram: "ph-instagram-logo", tiktok: "ph-tiktok-logo" };
  $("#redes").innerHTML = Object.entries(CONFIG.redes).filter(([, url]) => url).map(([red, url]) => `
    <a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${red}"><i class="ph ${iconosRedes[red]}" aria-hidden="true"></i></a>`).join("");

  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: CONFIG.nombre,
    telephone: CONFIG.telefono,
    email: CONFIG.email,
    address: { "@type": "PostalAddress", streetAddress: CONFIG.direccion, addressLocality: CONFIG.ciudad, addressRegion: CONFIG.region, addressCountry: "PE" },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    checkinTime: CONFIG.checkin,
    checkoutTime: CONFIG.checkout,
    numberOfRooms: CONFIG.habitaciones.reduce((s, h) => s + h.unidades, 0),
    priceRange: `S/ ${Math.min(...CONFIG.habitaciones.map((h) => h.precio))} – S/ ${Math.max(...CONFIG.habitaciones.map((h) => h.precioFinde || h.precio))}`,
    paymentAccepted: CONFIG.pagos.join(", "),
    amenityFeature: CONFIG.incluido.map((s) => ({ "@type": "LocationFeatureSpecification", name: s.nombre, value: true })),
  });
  document.head.appendChild(ld);

  /* ---------- Check-in (panel de reserva) ---------- */
  const drawer = $("#drawer");
  const llavero = $("#llavero");
  const waFlotante = $("#wa-flotante");

  $("#d-extras").innerHTML = CONFIG.extras.map((ex) => `
    <label class="extra">
      <input type="checkbox" value="${ex.id}" ${estado.extras.has(ex.id) ? "checked" : ""}>
      <i class="ph ${esc(ex.icono)}" aria-hidden="true"></i>
      <span class="extra__txt"><strong>${esc(ex.nombre)}</strong><small>${esc(ex.detalle)}</small></span>
      <span class="extra__precio" data-extra-precio="${ex.id}"></span>
    </label>`).join("");
  $("#d-extras").addEventListener("change", (e) => {
    if (e.target.checked) estado.extras.add(e.target.value); else estado.extras.delete(e.target.value);
    guardar();
    actualizarReserva();
  });

  function pintarTarjeta() {
    const nums = [...estado.reserva.keys()].map((id) => habPorId(id).numero);
    const nombre = $("#c-nombre").value.trim();
    $("#tarjeta").innerHTML = `
      <div class="tarjeta__arriba"><span class="tarjeta__marca">${nombreHTML}</span><span class="tarjeta__chip"></span></div>
      <div class="tarjeta__hab"><small>${nums.length > 1 ? "Habitaciones" : "Habitación"}</small>${nums.length ? esc(nums.join(" · ")) : "— — —"}</div>
      <div class="tarjeta__abajo">
        <span class="tarjeta__huesped">Huésped<strong>${esc(nombre || "Tu nombre")}</strong></span>
        <span>In → Out<strong>${esc(fmtCorta(estado.llegada))} → ${esc(fmtCorta(estado.salida))}</strong></span>
      </div>`;
  }

  function actualizarReserva() {
    const c = calcular();
    const cont = $("#contador");
    cont.hidden = !c.habitaciones;
    cont.textContent = c.habitaciones;

    $("#d-items").innerHTML = c.lineas.length ? c.lineas.map(({ hab, n, total }) => `
      <div class="item">
        <img src="${esc(hab.imagenes[0])}" alt="" data-fallback="${fallbackHab}">
        <div><strong>${esc(hab.numero)} · ${esc(hab.nombre)}</strong><small>${soles(total)}</small></div>
        <div class="cantidad" role="group" aria-label="Cantidad de ${esc(hab.corto)}">
          <button type="button" data-restar="${hab.id}" aria-label="Quitar una"><i class="ph ${n === 1 ? "ph-trash" : "ph-minus"}" aria-hidden="true"></i></button>
          <span>${n}</span>
          <button type="button" data-sumar="${hab.id}" aria-label="Agregar otra" ${n >= hab.unidades ? "disabled" : ""}><i class="ph ph-plus" aria-hidden="true"></i></button>
        </div>
      </div>`).join("") : `<div class="vacio">Aún no eliges habitación. <a href="#habitaciones" data-cerrar>Ir al pasillo</a></div>`;

    const aviso = $("#d-capacidad");
    if (c.lineas.length && estado.huespedes > c.capacidad) {
      aviso.hidden = false;
      aviso.innerHTML = `<i class="ph ph-warning" aria-hidden="true"></i><span>Elegiste espacio para ${plural(c.capacidad, "persona", "personas")} y vienen ${estado.huespedes}. Agrega otra habitación o una cama adicional.</span>`;
    } else aviso.hidden = true;

    CONFIG.extras.forEach((ex) => {
      const el = $(`[data-extra-precio="${ex.id}"]`);
      const p = precioExtra(ex, c.noches);
      el.classList.toggle("gratis", p === 0);
      el.textContent = p === 0 ? "Gratis" : "+" + solesCorto(p);
    });

    $("#d-resumen").innerHTML = c.lineas.length ? `
      <div><span>Habitaciones · ${plural(c.noches, "noche", "noches")}</span><span>${soles(c.subtotal)}</span></div>
      ${c.desc ? `<div class="desc"><span>Tarifa ${esc(c.desc.nombre.toLowerCase())} -${c.desc.porcentaje}%</span><span>-${soles(c.descMonto)}</span></div>` : ""}
      ${c.extras.length ? `<div><span>Extras</span><span>${soles(c.extrasTotal)}</span></div>` : ""}
      <div class="adelanto"><span>Adelanto para confirmar (${CONFIG.adelanto}%)</span><span>${soles(c.adelanto)}</span></div>` : "";
    $("#d-total").textContent = soles(c.total);

    const nums = c.lineas.map((l) => l.hab.numero).join(" · ");
    $("#llavero-titulo").textContent = `Hab. ${nums} · ${soles(c.total)}`;
    $("#llavero-detalle").textContent = textoEstadia();
    llavero.hidden = !c.habitaciones || drawer.open;
    waFlotante.classList.toggle("oculto", c.habitaciones > 0);

    const accion = $("#cuarto-acciones");
    if (accion && !accion.contains(document.activeElement)) accion.innerHTML = botonesCuarto(habPorId(estado.vista));
    pintarTarjeta();
  }

  function actualizarTodo() {
    pintarFechas();
    pintarCuarto();
    pintarCalculadora();
    actualizarReserva();
    $("#hab-resumen").innerHTML = `Precios para <strong>${esc(textoEstadia())}</strong>, con desayuno incluido.`;
    const desde = Math.min(...CONFIG.habitaciones.map((h) => conDescuento(precioEstadia(h), listaNoches().length)));
    $("#buscador-resumen").innerHTML = `${esc(textoEstadia())} · desde <strong>${soles(desde)}</strong> en total`;
  }

  function abrirCheckin() { drawer.showModal(); llavero.hidden = true; }
  $("#abrir-reserva").addEventListener("click", abrirCheckin);
  llavero.addEventListener("click", abrirCheckin);
  drawer.addEventListener("close", actualizarReserva);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer || e.target.closest("[data-cerrar]")) { drawer.close(); return; }
    const b = e.target.closest("#d-items button[data-sumar], #d-items button[data-restar]");
    if (b) {
      const id = b.dataset.sumar || b.dataset.restar;
      const h = habPorId(id);
      const n = Math.max(0, Math.min(h.unidades, (estado.reserva.get(id) || 0) + (b.dataset.sumar ? 1 : -1)));
      if (n) estado.reserva.set(id, n); else estado.reserva.delete(id);
      guardar();
      actualizarReserva();
    }
  });
  $("#c-nombre").addEventListener("input", (e) => {
    if (e.target.value.trim()) e.target.closest(".campo").classList.remove("error");
    pintarTarjeta();
  });
  $("#c-factura").addEventListener("change", (e) => { $("#c-ruc-wrap").hidden = !e.target.checked; });

  $("#form-reserva").addEventListener("submit", (e) => {
    e.preventDefault();
    const c = calcular();
    if (!c.lineas.length) { avisar("Elige al menos una habitación", "ph-info"); return; }
    const nombreInput = $("#c-nombre");
    const nombre = nombreInput.value.trim();
    if (!nombre) {
      nombreInput.closest(".campo").classList.add("error");
      nombreInput.focus();
      return;
    }
    const doc = $("#c-doc").value.trim();
    const hora = $("#c-hora").value;
    const motivo = $("#c-motivo").value;
    const pago = $("#c-pago").value;
    const factura = $("#c-factura").checked;
    const ruc = $("#c-ruc").value.trim();
    const notas = $("#c-notas").value.trim();
    const almohada = CONFIG.almohadas.find((a) => a.id === estado.almohada);

    const msg = [
      `Hola ${CONFIG.nombre} 👋, quiero reservar:`,
      "",
      `📅 Llegada: ${fmtFecha(estado.llegada)} (desde ${fmtHora(CONFIG.checkin)})`,
      `📅 Salida: ${fmtFecha(estado.salida)} (hasta ${fmtHora(CONFIG.checkout)})`,
      `🌙 ${plural(c.noches, "noche", "noches")} · 👥 ${plural(estado.huespedes, "huésped", "huéspedes")}`,
      "",
      "🛏️ Habitaciones",
      ...c.lineas.map((l) => `• ${l.n} x ${l.hab.numero} ${l.hab.nombre} — ${soles(l.total)}`),
      c.desc ? `Tarifa ${c.desc.nombre.toLowerCase()} (-${c.desc.porcentaje}%): -${soles(c.descMonto)}` : null,
      `☁️ Almohada: ${almohada ? almohada.nombre : "la que tengan"} (+ kit de descanso)`,
      ...(c.extras.length ? ["", "➕ Extras", ...c.extras.map(({ ex, total }) =>
        `• ${ex.nombre}${ex.cobro === "noche" ? ` (${plural(c.noches, "noche", "noches")})` : ""} — ${total ? soles(total) : `Gratis (${ex.gratisDesdeNoches}+ noches)`}`)] : []),
      "",
      `*Total: ${soles(c.total)}*`,
      `Adelanto para confirmar (${CONFIG.adelanto}%): ${soles(c.adelanto)}`,
      "",
      `👤 Nombre: ${nombre}`,
      doc ? `🪪 DNI/Pasaporte: ${doc}` : null,
      hora ? `🕐 Llego: ${hora}` : null,
      motivo ? `🧳 Motivo: ${motivo}` : null,
      `💳 Pago del adelanto: ${pago}`,
      factura ? `🧾 Factura: ${ruc || "sí (envío RUC por aquí)"}` : null,
      notas ? `📝 Notas: ${notas}` : null,
    ].filter((l) => l !== null).join("\n");

    window.open(waLink(msg), "_blank", "noopener");
  });

  /* ---------- Aviso flotante ---------- */
  const toast = $("#toast");
  let timerToast;
  function avisar(texto, icono = "ph-check-circle") {
    toast.innerHTML = `<i class="ph-fill ${icono}" aria-hidden="true"></i>${esc(texto)}`;
    toast.classList.add("visible");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => toast.classList.remove("visible"), 2000);
  }

  /* ---------- Imágenes con respaldo ---------- */
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) img.src = img.dataset.fallback;
  }, true);   // captura: el error de <img> no burbujea

  /* ---------- Entradas animadas (sin librerías) ---------- */
  $$(".nota").forEach((el) => el.setAttribute("data-aparecer", ""));
  $$(".cabecera > *, .incluido li, .reglas__lista li, .almohada, .recepcion__timbre > *").forEach((el, i) => {
    el.setAttribute("data-subir", "");
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
  });
  if ("IntersectionObserver" in window && !reducido) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$("[data-subir], [data-revelar], [data-aparecer]").forEach((el) => io.observe(el));
  } else {
    $$("[data-subir], [data-revelar], [data-aparecer]").forEach((el) => el.classList.add("visto"));
  }

  /* ---------- Inicio ---------- */
  pintarModo();
  pintarAlmohadas();
  actualizarTodo();
})();
