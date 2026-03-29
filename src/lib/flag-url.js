/**
 * Valida enlaces directos a imágenes de bandera (formatos habituales en la web).
 */
const FLAG_IMAGE_PATTERN = /\.(svg|png|jpe?g|webp)(\?|#|$)/i;

export function isValidFlagImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    return FLAG_IMAGE_PATTERN.test(u.href);
  } catch {
    return false;
  }
}

export const FLAG_URL_REQUIREMENTS =
  'Cada bandera debe ser un enlace http o https que apunte a un archivo .svg, .png, .jpg o .webp (puede llevar parámetros tras el nombre, p. ej. ?v=1).';
