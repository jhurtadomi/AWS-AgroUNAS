function isValidApiKey(receivedKey, expectedKey) {
  if (!expectedKey) return false;
  return receivedKey === expectedKey;
}

module.exports = {
  isValidApiKey
};
