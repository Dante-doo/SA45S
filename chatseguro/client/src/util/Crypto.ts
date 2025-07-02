/* util/crypto.ts */

const pemHeader = {
    public: "-----BEGIN PUBLIC KEY-----\n",
    private: "-----BEGIN PRIVATE KEY-----\n",
};
const pemFooter = {
    public: "\n-----END PUBLIC KEY-----",
    private: "\n-----END PRIVATE KEY-----",
};

/**
 * Convert an ArrayBuffer to a Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str);
}

/**
 * Convert a Base64 string to an ArrayBuffer
 */
export function base64ToArrayBuffer(b64: string): ArrayBuffer {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Format a Base64 string as PEM (header/footer + line breaks)
 */
export function formatAsPem(base64: string, type: 'public' | 'private'): string {
    const lines = base64.match(/.{1,64}/g) || [];
    return pemHeader[type] + lines.join("\n") + pemFooter[type];
}

/**
 * Strip PEM header/footer and return the Base64 content
 */
function pemToBase64(pem: string): string {
    return pem
        .replace(/-----BEGIN [^-]+-----/, '')
        .replace(/-----END [^-]+-----/, '')
        .replace(/\s+/g, '');
}

/**
 * Generate an RSA-OAEP key pair (2048 bits) and return PEM public + CryptoKey private
 */
export async function generateRsaKeyPair(): Promise<{ publicKeyPem: string; privateKey: CryptoKey }> {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );
    const spki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const pubB64 = arrayBufferToBase64(spki);
    const publicKeyPem = formatAsPem(pubB64, 'public');
    return { publicKeyPem, privateKey: keyPair.privateKey };
}

/**
 * Import a PEM-formatted RSA public key into a CryptoKey
 */
export async function importPublicKey(pem: string): Promise<CryptoKey> {
    const b64 = pemToBase64(pem);
    const buffer = base64ToArrayBuffer(b64);
    return await crypto.subtle.importKey(
        'spki',
        buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
    );
}

/**
 * Generate a random AES-GCM key (256-bit)
 */
export async function generateAesKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a message for a recipient: returns Base64 of encrypted AES key, iv, ciphertext and HMAC
 */
export async function encryptForRecipient(
    plaintext: string,
    recipientPublicKeyPem: string
): Promise<{
    encryptedAesKey: string;
    iv: string;
    ciphertext: string;
    hmac: string;
}> {
    // import recipient public key
    const recipientPub = await importPublicKey(recipientPublicKeyPem);

    // generate AES-GCM key and IV
    const aesKey = await generateAesKey();
    const ivBytes = crypto.getRandomValues(new Uint8Array(12));

    // encrypt plaintext
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: ivBytes },
        aesKey,
        encoder.encode(plaintext)
    );

    // export raw AES key and encrypt it with RSA-OAEP
    const rawAes = await crypto.subtle.exportKey('raw', aesKey);
    const encAesKeyBuf = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        recipientPub,
        rawAes
    );

    // compute HMAC-SHA-256 over iv + ciphertext using AES key
    const hmacKey = await crypto.subtle.importKey(
        'raw',
        rawAes,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const concatBuf = new Uint8Array(ivBytes.byteLength + encrypted.byteLength);
    concatBuf.set(ivBytes, 0);
    concatBuf.set(new Uint8Array(encrypted), ivBytes.byteLength);
    const hmacBuf = await crypto.subtle.sign('HMAC', hmacKey, concatBuf.buffer);

    return {
        encryptedAesKey: arrayBufferToBase64(encAesKeyBuf),
        iv: arrayBufferToBase64(ivBytes.buffer),
        ciphertext: arrayBufferToBase64(encrypted),
        hmac: arrayBufferToBase64(hmacBuf),
    };
}

/**
 * Decrypt a received message: verify HMAC and return plaintext
 */
export async function decryptFromSender(
    encryptedAesKeyB64: string,
    ivB64: string,
    ciphertextB64: string,
    hmacB64: string,
    privateKey: CryptoKey
): Promise<string> {
    // decode Base64 inputs
    const encAesKey = base64ToArrayBuffer(encryptedAesKeyB64);
    const iv = new Uint8Array(base64ToArrayBuffer(ivB64));
    const ciphertext = base64ToArrayBuffer(ciphertextB64);
    const receivedHmac = base64ToArrayBuffer(hmacB64);

    // decrypt AES key with RSA-OAEP
    const rawAes = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encAesKey
    );

    // import HMAC key and verify
    const hmacKey = await crypto.subtle.importKey(
        'raw',
        rawAes,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );
    const concatBuf = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    concatBuf.set(iv, 0);
    concatBuf.set(new Uint8Array(ciphertext), iv.byteLength);
    const isValid = await crypto.subtle.verify(
        'HMAC',
        hmacKey,
        receivedHmac,
        concatBuf.buffer
    );
    if (!isValid) {
        throw new Error('HMAC verification failed');
    }

    // import AES key and decrypt ciphertext
    const aesKey = await crypto.subtle.importKey(
        'raw',
        rawAes,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        ciphertext
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}
