/**
 * Browser-side API Key Security Obfuscation Utilities.
 * Protects user-supplied LLM API keys in localStorage from plain-text exposure.
 */

// Simple browser-safe salt for XOR obfuscation
const OBFUSCATION_SALT = 'ORBIT_OS_BYOK_SECURE_SALT_2026';

/**
 * Obfuscates a raw API key string before writing to localStorage.
 */
export function obfuscateKey(rawKey: string): string {
  if (!rawKey) return '';
  try {
    const chars = [];
    for (let i = 0; i < rawKey.length; i++) {
      const charCode = rawKey.charCodeAt(i) ^ OBFUSCATION_SALT.charCodeAt(i % OBFUSCATION_SALT.length);
      chars.push(String.fromCharCode(charCode));
    }
    return btoa(chars.join(''));
  } catch (err) {
    return rawKey; // Fallback
  }
}

/**
 * De-obfuscates an obfuscated string back into the raw API key for HTTPS server request headers.
 */
export function deobfuscateKey(obfuscatedKey: string): string {
  if (!obfuscatedKey) return '';
  try {
    const decoded = atob(obfuscatedKey);
    const chars = [];
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_SALT.charCodeAt(i % OBFUSCATION_SALT.length);
      chars.push(String.fromCharCode(charCode));
    }
    return chars.join('');
  } catch (err) {
    return obfuscatedKey; // Fallback
  }
}

/**
 * Formats an API key for safe UI display (e.g., "sk-proj-••••••••4A91").
 */
export function maskKeyDisplay(key: string): string {
  if (!key) return 'No key set';
  const clean = key.trim();
  if (clean.length <= 8) {
    return '••••••••';
  }
  const prefix = clean.substring(0, 6);
  const suffix = clean.substring(clean.length - 4);
  return `${prefix}••••••••${suffix}`;
}
