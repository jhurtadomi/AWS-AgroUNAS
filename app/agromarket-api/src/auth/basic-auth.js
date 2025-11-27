function parseBasicAuthHeader(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  const base64 = header.replace('Basic ', '');
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');
  if (!username || !password) return null;
  return { username, password };
}

function checkBasicCredentials(header, validUsername, validPassword) {
  const creds = parseBasicAuthHeader(header);
  if (!creds) return false;
  return creds.username === validUsername && creds.password === validPassword;
}

module.exports = {
  checkBasicCredentials
};
