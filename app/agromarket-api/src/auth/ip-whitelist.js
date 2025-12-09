function normalizeIp(ip) {
  if (!ip) return '';
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
}

function isIpAllowed(requestIp, allowedIps) {
  if (!allowedIps || allowedIps === '0.0.0.0/0' || allowedIps === 'any') {
    return true; // Sin restricción real (demo)
  }

  // Asegurarse de que allowedIps sea un array
  if (Array.isArray(allowedIps)) {
    // Normalizamos y comparamos la IP de la solicitud con las IPs permitidas
    const normalizedRequestIp = normalizeIp(requestIp).toLowerCase();
    return allowedIps.some((allowedIp) => normalizeIp(allowedIp).toLowerCase() === normalizedRequestIp);
  }

  // Si `allowedIps` no es un array, se maneja como una sola IP
  const normalized = normalizeIp(requestIp);
  return normalized === allowedIps;
}

module.exports = {
  isIpAllowed
};
