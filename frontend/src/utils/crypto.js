// Simple AES-GCM encryption helpers for habit titles
// Key is generated client-side and stored in localStorage under 'habitTitleKey'

const KEY_STORAGE = 'habitTitleKey';

function toBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey() {
  let stored = localStorage.getItem(KEY_STORAGE);
  let rawKeyBytes;
  if (!stored) {
    rawKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(rawKeyBytes);
    localStorage.setItem(KEY_STORAGE, toBase64(rawKeyBytes));
  } else {
    rawKeyBytes = fromBase64(stored);
  }
  return crypto.subtle.importKey('raw', rawKeyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptText(plaintext) {
  try {
    const key = await getCryptoKey();
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const enc = new TextEncoder().encode(plaintext);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
    const cipherBytes = new Uint8Array(cipherBuf);
    return `${toBase64(iv)}:${toBase64(cipherBytes)}`;
  } catch (e) {
    // Fallback to plaintext if crypto fails (should be rare)
    return plaintext;
  }
}

export async function decryptText(cipher) {
  try {
    if (typeof cipher !== 'string' || !cipher.includes(':')) return cipher;
    const [ivB64, ctB64] = cipher.split(':');
    const iv = fromBase64(ivB64);
    const ct = fromBase64(ctB64);
    const key = await getCryptoKey();
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(plainBuf);
  } catch (e) {
    // If decryption fails, show a lock indicator rather than ciphertext
    return '🔒';
  }
}

// Utility to detect our ciphertext format (iv:cipher, both base64)
export function isCiphertext(str) {
  return typeof str === 'string' && str.includes(':');
}

