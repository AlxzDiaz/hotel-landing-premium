/* ==========================================================
   CONFIGURACIÓN DEL HOTEL
   Todo lo que cambia de un cliente a otro está en este archivo.
   No hace falta tocar main.js para personalizar la página.
   ========================================================== */

// Fotos de Unsplash (licencia gratuita, uso comercial permitido).
// Para un cliente real: reemplaza por sus fotos, p. ej. "images/habitaciones/102-1.webp"
const foto = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? "&h=" + h : ""}&q=70`;

const CONFIG = {
  nombre: "Hotel Aguaje",
  eslogan: "Hotel · Puerto Maldonado",

  // WhatsApp: código de país + número, sin "+", espacios ni guiones
  whatsapp: "51944870026",
  // Demo del portafolio ALXZ//: marca los mensajes con "[Demo ALXZ//]" y muestra el aviso.
  // Para un cliente real: pon su número arriba y demo: false.
  demo: true,
  telefono: "+51 999 999 999",
  email: "reservas@hotelaguaje.pe",

  direccion: "Av. León Velarde 845, Puerto Maldonado",
  ciudad: "Puerto Maldonado",
  region: "Madre de Dios",
  // En Google Maps: clic derecho sobre el local → copiar coordenadas
  ubicacion: { lat: -12.5925, lng: -69.1847 },

  // Deja una red en "" para ocultarla
  redes: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    tiktok: "",
  },

  /* La portada cambia según la hora de Perú: de 6 a. m. a 6 p. m. se ve "de día";
     el resto, "de noche". El visitante también puede cambiarlo con el botón sol/luna. */
  portada: {
    dia: {
      saludo: "Buenos días",
      titulo: "Despierta <em>descansado</em>.",
      texto: "Ventanales con luz de mañana, desayuno buffet desde las 6:30 y una cama que no quieres dejar.",
      imagen: foto("1549638441-b787d2e11f14", 1800, 1200),
    },
    tarde: {
      saludo: "Buenas tardes",
      titulo: "Tu cuarto ya está <em>fresco</em>.",
      texto: "Entrada desde la 1 p. m., aire acondicionado silencioso y agua caliente para quitarte el viaje de encima.",
      imagen: foto("1549638441-b787d2e11f14", 1800, 1200),
    },
    noche: {
      saludo: "Buenas noches",
      titulo: "Aquí se <em>duerme</em> bien.",
      texto: "Colchones ortopédicos, cortinas blackout, doble vidrio y horas de silencio. Llega a la hora que llegues.",
      imagen: foto("1630660664869-c9d3cc676880", 1800, 1200),
    },
  },

  // Usa las calificaciones REALES del cliente. max: escala de cada página (Google 5, Booking 10).
  ratings: [
    { fuente: "Google", valor: 4.7, total: 386, max: 5 },
    { fuente: "Booking.com", valor: 8.9, total: 241, max: 10 },
  ],

  // Horas en formato 24 h
  checkin: "13:00",
  checkout: "11:00",
  silencio: { desde: "22:00", hasta: "07:00" },
  adelanto: 50,                // % que se paga para confirmar la reserva
  cancelacionHoras: 48,        // cambios y cancelación sin costo hasta X horas antes
  pagos: ["Yape", "Plin", "Transferencia", "Tarjeta", "Efectivo"],
  factura: true,               // emite boleta y factura (aparece en el formulario)
  comisionApps: 18,            // % aprox. que cobran las apps (para el recibo comparativo)

  // Fechas con tarifa especial (feriados, festividades). El recargo se suma a esas noches.
  temporadas: [
    { nombre: "Fiestas Patrias", desde: "2026-07-24", hasta: "2026-07-31", recargo: 20 },
    { nombre: "Fiestas de fin de año", desde: "2026-12-23", hasta: "2027-01-02", recargo: 25 },
  ],

  // Descuentos por estadía larga. Se aplica solo el mayor que corresponda.
  estadias: [
    { nombre: "Por semana", minNoches: 7, porcentaje: 10 },
    { nombre: "Por mes", minNoches: 28, porcentaje: 25 },
  ],
  convenio: "¿Tu empresa envía personal seguido? Tarifa fija todo el año, factura mensual y habitaciones aseguradas.",

  /* "24 horas en el hotel": el recorrido que se ve al hacer scroll.
     hora en formato 24 h · la foto cambia en cada momento */
  dia: [
    { hora: "13:00", titulo: "Llegas y te entregamos tu llave", icono: "ph-key",
      texto: "Entrada desde la 1 p. m. Registro en 3 minutos y alguien te acompaña con las maletas.",
      imagen: foto("1759038086832-795644825e3a", 900, 1100) },
    { hora: "15:00", titulo: "Tu cuarto, a tu temperatura", icono: "ph-snowflake",
      texto: "Aire acondicionado silencioso, agua caliente de verdad y Wi-Fi de fibra para trabajar o ver series.",
      imagen: foto("1631049035509-076f10beb2fe", 900, 1100) },
    { hora: "19:30", titulo: "Eliges tu almohada", icono: "ph-cloud",
      texto: "Firme, suave, viscoelástica o cervical. Te la dejamos en la cama junto a un kit de descanso.",
      imagen: foto("1638127815875-d8c930a8d467", 900, 1100) },
    { hora: "22:00", titulo: "Empieza el silencio", icono: "ph-moon-stars",
      texto: "Horas de silencio hasta las 7 a. m. Doble vidrio, cortinas blackout y pasillos alfombrados.",
      imagen: foto("1631049780150-c197bf723954", 900, 1100) },
    { hora: "06:30", titulo: "Desayuno buffet", icono: "ph-coffee",
      texto: "Pan del día, huevos al gusto, frutas, jugo natural y café de la región. Hasta las 10 a. m.",
      imagen: foto("1578704311587-4fbd590630d5", 900, 1100) },
    { hora: "11:00", titulo: "Sales sin prisa", icono: "ph-suitcase-rolling",
      texto: "Guardamos tu equipaje gratis el tiempo que necesites. ¿Vuelo de noche? Pide salida tarde.",
      imagen: foto("1787168295699-03aed18d17d4", 900, 1100) },
  ],

  // Siempre incluido (lista corta bajo el recorrido)
  incluido: [
    { nombre: "Desayuno buffet", icono: "ph-coffee" },
    { nombre: "Wi-Fi de fibra 100 Mbps", icono: "ph-wifi-high" },
    { nombre: "Agua caliente 24 h", icono: "ph-shower" },
    { nombre: "Limpieza diaria", icono: "ph-sparkle" },
    { nombre: "Recepción 24 h", icono: "ph-bell-simple" },
    { nombre: "Cochera vigilada", icono: "ph-car" },
    { nombre: "Guardamos tu equipaje", icono: "ph-suitcase-rolling" },
    { nombre: "Agua filtrada gratis", icono: "ph-drop" },
  ],

  // Carta de almohadas (sin costo). Se elige una y llega en el mensaje de la reserva.
  almohadas: [
    { id: "firme", nombre: "Firme", detalle: "Para quien duerme de costado", icono: "ph-rectangle" },
    { id: "pluma", nombre: "Suave de pluma", detalle: "Para quien duerme boca abajo", icono: "ph-feather" },
    { id: "visco", nombre: "Viscoelástica", detalle: "Se adapta a tu cabeza", icono: "ph-wave-sine" },
    { id: "cervical", nombre: "Cervical", detalle: "Si despiertas con el cuello cansado", icono: "ph-person-simple" },
  ],
  kitDescanso: ["Antifaz", "Tapones para oídos", "Infusión de manzanilla"],

  // Íconos y nombres de las comodidades (se usan con su clave en cada habitación)
  amenidades: {
    aire: { nombre: "Aire acondicionado", icono: "ph-snowflake" },
    wifi: { nombre: "Wi-Fi de fibra", icono: "ph-wifi-high" },
    bano: { nombre: "Baño privado con agua caliente", icono: "ph-shower" },
    tv: { nombre: "Smart TV 43\" con cable", icono: "ph-television-simple" },
    desayuno: { nombre: "Desayuno buffet incluido", icono: "ph-coffee" },
    blackout: { nombre: "Cortinas blackout", icono: "ph-moon" },
    frigobar: { nombre: "Frigobar", icono: "ph-thermometer-cold" },
    escritorio: { nombre: "Escritorio de trabajo", icono: "ph-desk" },
    cajaFuerte: { nombre: "Caja fuerte", icono: "ph-lock-key" },
    sofa: { nombre: "Sala con sofá", icono: "ph-couch" },
    ducha: { nombre: "Ducha de lluvia", icono: "ph-drop-half" },
    cuna: { nombre: "Cuna a pedido", icono: "ph-baby" },
    hervidor: { nombre: "Hervidor con café e infusiones", icono: "ph-coffee-bean" },
  },

  /* Habitaciones (en la página se ven como puertas de un pasillo)
     - id: único y sin espacios (se usa para guardar la reserva)
     - numero: lo que va en la placa de la puerta
     - precio: por noche de domingo a jueves · precioFinde: noches de viernes y sábado (opcional)
     - precioApps: lo que cuesta en Booking/Airbnb (opcional). Se muestra en el recibo comparativo.
     - unidades: cuántas habitaciones de ese tipo tiene el hotel */
  habitaciones: [
    { id: "simple", numero: "101", nombre: "Simple ejecutiva", corto: "Simple",
      precio: 90, precioFinde: 95, precioApps: 105, capacidad: 1, camas: "1 cama de 2 plazas", m2: 16, unidades: 8,
      descripcion: "Pensada para quien viaja por trabajo: cama de 2 plazas, escritorio con buena luz y enchufes al lado de la cama.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "escritorio", "blackout"],
      imagenes: [foto("1600908389678-64b54d9cf054"), foto("1631049035509-076f10beb2fe")] },

    { id: "matrimonial", numero: "102", nombre: "Matrimonial clásica", corto: "Matrimonial", etiqueta: "La más pedida",
      precio: 130, precioFinde: 145, precioApps: 155, capacidad: 2, camas: "1 cama queen", m2: 20, unidades: 10,
      descripcion: "Cama queen con colchón ortopédico, aire acondicionado silencioso y cortinas blackout. Para dormir de verdad.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "blackout", "frigobar"],
      imagenes: [foto("1576354302919-96748cb8299e"), foto("1718894070114-6de0e98449a2")] },

    { id: "doble", numero: "103", nombre: "Doble con dos camas", corto: "Doble",
      precio: 140, precioFinde: 155, precioApps: 165, capacidad: 2, camas: "2 camas de 1½ plaza", m2: 22, unidades: 6,
      descripcion: "Dos camas amplias e independientes. Ideal para compañeros de trabajo, amigos o mamá e hijo.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "blackout", "escritorio"],
      imagenes: [foto("1648383228240-6ed939727ad6"), foto("1619128395560-8a749ac9926d")] },

    { id: "superior", numero: "201", nombre: "Matrimonial superior", corto: "Superior", etiqueta: "Renovada",
      precio: 175, precioFinde: 195, precioApps: 209, capacidad: 2, camas: "1 cama king", m2: 28, unidades: 4,
      descripcion: "Nuestra habitación más cómoda: cama king, ventanal en el último piso, ducha de lluvia y hervidor con café.",
      amenidades: ["aire", "bano", "ducha", "desayuno", "wifi", "tv", "blackout", "frigobar", "cajaFuerte", "hervidor"],
      imagenes: [foto("1690935986319-c11e6cae84f7"), foto("1649369365908-a0d1225e0b05")] },

    { id: "triple", numero: "202", nombre: "Triple", corto: "Triple",
      precio: 185, precioFinde: 200, precioApps: 215, capacidad: 3, camas: "3 camas de 1½ plaza", m2: 26, unidades: 2,
      descripcion: "Tres camas independientes y espacio para las maletas de todos. Muy pedida por equipos de trabajo.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "blackout", "frigobar", "escritorio"],
      imagenes: [foto("1741506131058-533fcf894483"), foto("1605346576608-92f1346b67d6")] },

    { id: "familiar", numero: "203", nombre: "Suite familiar", corto: "Familiar",
      precio: 230, precioFinde: 250, precioApps: 269, capacidad: 4, camas: "1 cama queen + 2 camas de 1 plaza", m2: 36, unidades: 2,
      descripcion: "Dormitorio con dos ambientes y una pequeña sala con sofá. Espacio para toda la familia sin separarse. Cuna gratis.",
      amenidades: ["aire", "bano", "desayuno", "wifi", "tv", "sofa", "blackout", "frigobar", "cuna", "cajaFuerte"],
      imagenes: [foto("1771775529138-a7a20ba7e032"), foto("1744000311635-0280df5cc00e")] },
  ],

  /* Extras que el huésped puede sumar a su reserva
     cobro: "unico" (una vez) · "noche" (por noche) · "personaNoche" (por huésped y por noche)
     gratisDesdeNoches: el extra sale gratis si la estadía llega a esas noches (opcional) */
  extras: [
    { id: "temprano", nombre: "Entrada temprana", detalle: "Tu habitación lista desde las 8 a. m.", precio: 40, cobro: "unico", icono: "ph-sun-horizon" },
    { id: "tarde", nombre: "Salida tarde", detalle: "Quédate hasta las 6 p. m.", precio: 40, cobro: "unico", icono: "ph-clock-afternoon" },
    { id: "recojo", nombre: "Recojo del aeropuerto o terminal", detalle: "Te esperamos con tu nombre", precio: 25, cobro: "unico", gratisDesdeNoches: 4, icono: "ph-van" },
    { id: "cama", nombre: "Cama adicional", detalle: "Plegable, con sábanas y almohada", precio: 35, cobro: "noche", icono: "ph-bed" },
    { id: "cochera", nombre: "Cochera techada", detalle: "Espacio reservado para tu auto", precio: 10, cobro: "noche", icono: "ph-garage" },
    { id: "lavanderia", nombre: "Lavandería", detalle: "Hasta 4 kg, lista en el día", precio: 15, cobro: "unico", icono: "ph-washing-machine" },
  ],

  // Libro de visitas: usa reseñas REALES del cliente (copiadas de Google o Booking)
  testimonios: [
    { nombre: "Carlos M.", pais: "Arequipa", fuente: "Google", estrellas: 5, habitacion: "101", noches: 12,
      texto: "Vine por una obra y me quedé casi dos semanas. Wi-Fi rápido, escritorio cómodo y la tarifa semanal me ayudó con los viáticos." },
    { nombre: "Rosa y Daniel", pais: "Lima", fuente: "Booking.com", estrellas: 5, habitacion: "201", noches: 2,
      texto: "La cama king es una maravilla y no se escucha nada de la calle. Pedimos almohada de pluma y dormimos como nunca." },
    { nombre: "Familia Quispe", pais: "Cusco", fuente: "Google", estrellas: 5, habitacion: "203", noches: 3,
      texto: "Entramos los cuatro con espacio de sobra. Nos dieron cuna para el bebé sin pedirla dos veces. Todo muy limpio." },
    { nombre: "Mariela T.", pais: "Juliaca", fuente: "Booking.com", estrellas: 4, habitacion: "103", noches: 1,
      texto: "Llegué a las 3 a. m. en bus y me recibieron sin problema. Agua caliente de verdad y aire que no hace ruido." },
  ],

  // Reglas de la casa
  politicas: [
    { titulo: "Entrada", texto: "Desde la 1 p. m. Si llegas antes, guardamos tu equipaje o pide entrada temprana." },
    { titulo: "Salida", texto: "Hasta las 11 a. m. Pide salida tarde si tu viaje es en la noche." },
    { titulo: "Cancelación", texto: "Sin costo hasta 48 horas antes. Después se retiene el adelanto." },
    { titulo: "Documentos", texto: "DNI o pasaporte de todos los huéspedes. Los menores van con sus padres." },
    { titulo: "Niños", texto: "Menores de 5 años no pagan si duermen con sus padres. Cuna gratis." },
    { titulo: "Silencio y humo", texto: "Silencio de 10 p. m. a 7 a. m. No se fuma en el hotel. No se admiten mascotas." },
  ],

  preguntas: [
    { p: "¿Cómo confirmo mi reserva?",
      r: "Envíanos tu solicitud por WhatsApp desde esta página. Te confirmamos la disponibilidad en minutos y, para asegurarla, pagas el 50% de adelanto por Yape, Plin o transferencia. El resto lo pagas al llegar." },
    { p: "¿Emiten boleta y factura?",
      r: "Sí. Indícanos el RUC y la razón social al reservar o al llegar y te entregamos la factura electrónica al salir. Para estadías por mes podemos facturar a tu empresa." },
    { p: "¿Puedo llegar de madrugada?",
      r: "Sí, la recepción atiende las 24 horas. Avísanos tu hora aproximada y te tenemos la habitación lista. Si quieres entrar antes de la 1 p. m. sin esperar, agrega la entrada temprana." },
    { p: "¿Tienen estacionamiento?",
      r: "Sí, cochera vigilada para autos y motos sin costo, según disponibilidad. Si quieres un espacio techado asegurado, agrégalo a tu reserva." },
    { p: "¿La almohada tiene costo?",
      r: "No. Eliges una de la carta de almohadas al reservar y te la dejamos en la cama con el kit de descanso. Si cambias de opinión, pídela en recepción." },
  ],
};
