# Landing de hotel · "Del día a la noche"

Página para hoteles y hostales que **solo alojan**: sin tours ni lugares turísticos. A diferencia de los otros demos (restaurante, tienda, hostal), esta no usa la plantilla de portada con arco + tarjetas + cinta: tiene su propio concepto, pensado alrededor del descanso.

Usa HTML, CSS y JavaScript, sin build y **sin librerías de animación**. Solo hay que subir la carpeta.

```
hotel-landing/
├── index.html          estructura + SEO
├── css/styles.css      estilos (dos temas: día y noche, arriba del archivo)
├── js/config.js        ← DATOS DEL HOTEL: casi todo se cambia aquí
├── js/main.js          lógica (no hace falta tocarlo)
└── images/             logo, favicon e ilustraciones de respaldo
```

## Lo que la hace única

| Idea | Qué hace |
|---|---|
| **La página sabe qué hora es** | Con la hora de Perú cambia el saludo ("Buenos días / Buenas tardes / Buenas noches"), la foto, el título y todo el tema: de día es papel claro y de noche azul medianoche. Un botón sol/luna lo cambia a mano y se recuerda. |
| **24 horas en el hotel** | Al hacer scroll, un panel fijo muestra la hora en grande, un sol o una luna que recorre el cielo y la foto de cada momento: entrada, tu cuarto, la almohada, el silencio, el desayuno y la salida. |
| **El pasillo** | Las habitaciones son **puertas con su número** (101, 102…). Al pasar el mouse se entreabren y al tocarlas se abren del todo, muestran el cuarto y cuelgan el cartel "Tu cuarto". Se puede recorrer con las flechas del teclado. |
| **Brújula** | Tres preguntas (con quién viajas, a qué vienes y si quieres ahorrar o darte un gusto) que recomiendan una habitación y le abren la puerta. |
| **Carta de almohadas** | Firme, suave de pluma, viscoelástica o cervical, más el kit de descanso. Lo elegido llega en el mensaje de WhatsApp. |
| **Recibos: app vs directo** | Una barra de 1 a 30 noches calcula en vivo dos recibos de papel: lo que pagarías en una app y lo que pagas directo, con el sello "Ahorras S/ X" y los descuentos por semana y por mes. |
| **Libro de visitas** | Las reseñas son notas escritas a mano, pegadas con cinta, con número de habitación y noches. |
| **Timbre de recepción** | Un timbre que suena (de verdad) y abre WhatsApp con recepción. |
| **Check-in con llave** | El panel de reserva muestra una **llave magnética** que se llena sola con la habitación, el nombre del huésped y las fechas. Mientras hay reserva, abajo aparece un llavero con el total. |

**Tipografías (Google Fonts):** Instrument Serif para títulos, Geist para el texto, Geist Mono para horas, números y etiquetas (estilo señalética de hotel) y Caveat para las notas escritas a mano. **Íconos:** [Phosphor](https://phosphoricons.com).

**Colores:** modo día con papel `#F4EFE6`, tinta `#1B1A17` y terracota `#AE4E26` (botones con texto blanco, 5.4:1); modo noche con medianoche `#0D1020`, crema `#EDE6D8` y luz de lámpara `#F0B45A` (botones con texto oscuro, 10:1). Todos los textos pasan el contraste mínimo de 4.5:1.

## Personalizar para un cliente

1. **`js/config.js`:**
   - **Datos básicos:** nombre, WhatsApp (`51` + número, sin espacios), dirección, coordenadas, redes y correo.
   - **Portada:** saludo, título, texto y foto para la mañana, la tarde y la noche.
   - **24 horas:** los momentos del día con su hora, texto y foto.
   - **Reservas:** entrada, salida, horas de silencio, % de adelanto, pagos, factura y temporadas.
   - **Tarifas por estadía:** noches mínimas y % de descuento.
   - **Habitaciones:** número de puerta, precios, capacidad, camas, m², cuántas hay y comodidades.
   - **Almohadas y kit de descanso, extras, reseñas, reglas y preguntas.**
2. **`index.html`:** cambia el `<title>`, la `meta description` y la `og:image`.
3. **Logo:** reemplaza `images/logo.svg` y `favicon.svg`.
4. **Colores:** edita los dos bloques de variables (`[data-modo="dia"]` y `[data-modo="noche"]`) al inicio de `css/styles.css`.

### Cómo cargar una habitación

```js
{ id: "matrimonial", numero: "102", nombre: "Matrimonial clásica", corto: "Matrimonial",
  precio: 130,          // por noche, domingo a jueves
  precioFinde: 145,     // opcional: noches de viernes y sábado
  precioApps: 155,      // opcional: precio en Booking/Airbnb (para el recibo comparativo)
  capacidad: 2, camas: "1 cama queen", m2: 20,
  unidades: 10,         // cuántas habitaciones de este tipo tiene el hotel
  etiqueta: "La más pedida",                                // opcional
  amenidades: ["aire", "bano", "desayuno", "wifi", "tv"],   // claves de CONFIG.amenidades
  descripcion: "…",
  imagenes: ["images/habitaciones/102-1.webp", "images/habitaciones/102-2.webp"] },
```

- El `id` no debe tener espacios y no conviene cambiarlo después: con él se guarda la reserva en el navegador.
- La primera foto es la que se ve detrás de la puerta. Usa fotos horizontales 4:3 (800 × 600 px) en WebP de menos de 150 KB.
- Con 6 habitaciones las puertas entran en una fila en PC. Con más, el pasillo se desliza de lado.

### Datos que deben ser reales

Las calificaciones, las reseñas, los precios en apps, la comisión de las apps y la historia del hotel son **de ejemplo**. Con un cliente real usa solo sus datos. Si el precio "en apps" del recibo no es el que de verdad aparece en Booking, el huésped lo comprueba en un minuto y deja de confiar.

## Cómo llega la reserva

```
Hola Hotel Aguaje 👋, quiero reservar:

📅 Llegada: sáb, 3 oct 2026 (desde 1 p. m.)
📅 Salida: lun, 5 oct 2026 (hasta 11 a. m.)
🌙 2 noches · 👥 2 huéspedes

🛏️ Habitaciones
• 1 x 102 Matrimonial clásica — S/ 275.00
☁️ Almohada: Viscoelástica (+ kit de descanso)

*Total: S/ 275.00*
Adelanto para confirmar (50%): S/ 137.50

👤 Nombre: Ana Torres
💳 Pago del adelanto: Yape
```

La página **no confirma disponibilidad**: envía una solicitud y el hotel responde por WhatsApp.

## Probar en tu computadora

```bash
python -m http.server 8000
```

Luego entra a `http://localhost:8000`. También funciona con Live Server de VS Code.

## Publicar

- **Netlify:** arrastra la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub:** en VS Code, botón **"Publicar Branch"**. Después puedes activar GitHub Pages en *Settings → Pages*.

## Checklist antes de entregar

- [ ] Se ve bien en un celular real, de día y de noche
- [ ] "Enviar solicitud" y el timbre abren WhatsApp con el número correcto
- [ ] Los precios por noche, de fin de semana, de temporadas y por estadía son los reales
- [ ] El precio "en apps" es el que aparece hoy en Booking/Airbnb (o se quitó)
- [ ] Los números de puerta y la cantidad de habitaciones son los reales
- [ ] El hotel de verdad ofrece la carta de almohadas y el kit (o se quitó la sección)
- [ ] Las fotos son del hotel
- [ ] Las calificaciones y reseñas son reales
- [ ] Título, descripción, logo y redes sociales son los del cliente
