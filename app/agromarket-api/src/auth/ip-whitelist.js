function normalizeIp(ip) {
  if (!ip) return '';
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
}

function isIpAllowed(requestIp, allowedIp) {
  if (!allowedIp || allowedIp === '0.0.0.0/0' || allowedIp.toLowerCase() === 'any') {
    return true; // sin restricción real (demo)
  }
  const normalized = normalizeIp(requestIp);
  return normalized === allowedIp;
}

module.exports = {
  isIpAllowed
};
