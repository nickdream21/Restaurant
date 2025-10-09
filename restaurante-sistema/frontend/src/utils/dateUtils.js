/**
 * Utilidades para manejo de fechas en zona horaria de Perú (America/Lima, UTC-5)
 */

/**
 * Convierte una fecha UTC del servidor a hora de Perú
 * @param {string|Date} dateString - Fecha en formato UTC del servidor
 * @returns {Date} - Fecha ajustada a hora de Perú
 */
export function convertirUTCaPerú(dateString) {
  if (!dateString) return new Date();

  // Crear fecha desde el string UTC
  const fecha = new Date(dateString);

  // SQLite guarda en UTC sin indicador 'Z', así que debemos tratarla como UTC
  // Si la fecha no tiene 'Z', añadirla para que JavaScript la trate como UTC
  let fechaUTC;
  if (typeof dateString === 'string' && !dateString.endsWith('Z')) {
    fechaUTC = new Date(dateString + 'Z');
  } else {
    fechaUTC = new Date(dateString);
  }

  return fechaUTC;
}

/**
 * Formatea una fecha a hora local de Perú en formato 12h con AM/PM
 * @param {string|Date} dateString - Fecha del servidor
 * @returns {string} - Hora formateada (ej: "01:45 PM")
 */
export function formatearHoraPerú(dateString) {
  const fecha = convertirUTCaPerú(dateString);

  return fecha.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Lima'
  });
}

/**
 * Formatea una fecha completa a formato de Perú
 * @param {string|Date} dateString - Fecha del servidor
 * @returns {string} - Fecha y hora formateada
 */
export function formatearFechaCompletaPerú(dateString) {
  const fecha = convertirUTCaPerú(dateString);

  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Lima'
  });
}

/**
 * Calcula el tiempo transcurrido desde una fecha hasta ahora
 * @param {string|Date} dateString - Fecha del servidor
 * @returns {Object} - {minutos: number, texto: string}
 */
export function calcularTiempoTranscurrido(dateString) {
  if (!dateString) return { minutos: 0, texto: '0 min' };

  const fecha = convertirUTCaPerú(dateString);
  const ahora = new Date();

  const diferenciaMs = ahora - fecha;
  const minutos = Math.floor(diferenciaMs / 60000);

  // Si es negativo o muy grande, hay un problema con la fecha
  if (minutos < 0 || minutos > 1440) { // más de 24 horas
    return { minutos: 0, texto: 'Reciente' };
  }

  if (minutos < 60) {
    return { minutos, texto: `${minutos} min` };
  } else {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return { minutos, texto: `${horas}h ${mins}m` };
  }
}
