import CryptoJS from 'crypto-js';
import crypto from 'crypto';

/**
 * Decrypt a base64-encoded DES-ECB ciphertext with the given key string.
 * Key used by JioSaavn: '38346591'
 */
export function decryptDesEcb(base64Cipher, keyStr = '38346591') {
	if (!base64Cipher || typeof base64Cipher !== 'string') return null;

	// 1. Primary: CryptoJS DES-ECB PKCS7 (environment independent, no OpenSSL flags needed)
	try {
		const key = CryptoJS.enc.Utf8.parse(keyStr);
		const decrypted = CryptoJS.DES.decrypt(
			{ ciphertext: CryptoJS.enc.Base64.parse(base64Cipher.trim()) },
			key,
			{
				mode: CryptoJS.mode.ECB,
				padding: CryptoJS.pad.Pkcs7
			}
		);
		const plain = decrypted.toString(CryptoJS.enc.Utf8);
		if (plain && plain.startsWith('http')) {
			return plain;
		}
	} catch (e) {
		// fallback to node crypto
	}

	// 2. Secondary fallback: Node.js native crypto
	try {
		const key = Buffer.from(keyStr, 'utf8');
		const decipher = crypto.createDecipheriv('des-ecb', key, '');
		let decrypted = decipher.update(base64Cipher.trim(), 'base64', 'utf8');
		decrypted += decipher.final('utf8');
		if (decrypted && decrypted.startsWith('http')) {
			return decrypted;
		}
	} catch (e) {
		// silently fail fallback
	}

	return null;
}

/**
 * Build multiple audio stream quality URLs from a decrypted base URL.
 */
export function buildAudioStreams(decryptedUrl) {
	if (!decryptedUrl) return { high: null, medium: null, low: null };

	const high = decryptedUrl.replace('_96.mp4', '_320.mp4').replace('_96.mp3', '_320.mp3');
	const medium = decryptedUrl.replace('_96.mp4', '_160.mp4').replace('_96.mp3', '_160.mp3');
	const low = decryptedUrl;

	return { high, medium, low };
}
