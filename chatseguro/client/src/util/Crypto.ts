export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
    const base64Standard = b64.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64Standard.length % 4) % 4);
    const binary = atob(base64Standard + padding);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function generateRsaKeyPair(): Promise<{ publicKeyB64: string; privateKey: CryptoKey }> {
    const keyPair = await crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt']
    );
    const spki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyB64 = arrayBufferToBase64(spki);
    return { publicKeyB64, privateKey: keyPair.privateKey };
}

export async function importPublicKey(b64: string): Promise<CryptoKey> {
    const buffer = base64ToArrayBuffer(b64);
    return await crypto.subtle.importKey('spki', buffer, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
}

export async function importPrivateKey(b64: string): Promise<CryptoKey> {
    const buffer = base64ToArrayBuffer(b64);
    return await crypto.subtle.importKey('pkcs8', buffer, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']);
}

export async function encryptForRecipient(
    plaintext: string,
    recipientPublicKeyB64: string
): Promise<{
    encryptedAesKey: string;
    iv: string;
    ciphertext: string;
}> {
    const recipientPub = await importPublicKey(recipientPublicKeyB64);
    const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        new TextEncoder().encode(plaintext)
    );

    const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedAesKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        recipientPub,
        rawAesKey
    );

    return {
        encryptedAesKey: arrayBufferToBase64(encryptedAesKey),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(encryptedData),
    };
}

export async function decryptFromSender(
    encryptedAesKeyB64: string,
    ivB64: string,
    ciphertextB64: string,
    privateKey: CryptoKey
): Promise<string> {
    const encryptedAesKey = base64ToArrayBuffer(encryptedAesKeyB64);
    const iv = base64ToArrayBuffer(ivB64);
    const ciphertext = base64ToArrayBuffer(ciphertextB64);

    const rawAesKey = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedAesKey
    );

    const aesKey = await crypto.subtle.importKey(
        'raw',
        rawAesKey,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        ciphertext
    );

    return new TextDecoder().decode(decryptedData);
}