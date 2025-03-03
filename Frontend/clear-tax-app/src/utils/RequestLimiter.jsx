const requestLogs = new Map();

const canProceed = (key, maxRequests = 5, timeWindow = 10000) => {
  const currentTime = Date.now();
console.log(requestLogs);
  // Initialize request log for the key
  if (!requestLogs.has(key)) {
    requestLogs.set(key, []);
  }

  // Get the request timestamps for this key
  const timestamps = requestLogs.get(key);

  // Filter out timestamps that are outside the allowed time window
  const validTimestamps = timestamps.filter(
    (timestamp) => currentTime - timestamp < timeWindow
  );

  // Update the log with valid timestamps only
  requestLogs.set(key, validTimestamps);

  // Allow request if under the limit
  if (validTimestamps.length < maxRequests) {
    validTimestamps.push(currentTime);
    return true; // Request allowed
  }

  // Deny request if over the limit
  return false; // Rate limit exceeded
};

const RequestLimiter = {
  canProceed,
};

export default RequestLimiter;
