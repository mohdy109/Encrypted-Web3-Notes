export async function encryptNote(text, password) {
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: encoder.encode('salt'), iterations: 100000, hash: 'SHA-256' },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, encoder.encode(text));
    return { encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))), iv: Array.from(iv) };
  }
  
  export async function decryptNote(encrypted, iv, password) {
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: encoder.encode('salt'), iterations: 100000, hash: 'SHA-256' },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, derivedKey, encryptedBytes);
    return new TextDecoder().decode(decrypted);
  }