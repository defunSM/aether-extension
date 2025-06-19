/**
 * Utility functions for encryption and decryption
 * Uses the Web Crypto API for secure encryption
 */

// A fixed salt used for key derivation - in production, consider generating and storing a unique salt
const SALT = new Uint8Array([
    21, 34, 56, 78, 98, 45, 32, 45, 65, 12, 
    234, 67, 89, 43, 12, 56
  ]);
  
  // The initialization vector length
  const IV_LENGTH = 12;
  
  /**
   * Derives an encryption key from a password using PBKDF2
   * @param {string} password - The password to derive the key from
   * @returns {Promise<CryptoKey>} The derived key
   */
  async function deriveKey(password) {
    // Convert password string to buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import the password as a key
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Derive a key using PBKDF2
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: SALT,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Encrypts data using AES-GCM
   * @param {string} data - The data to encrypt
   * @param {string} password - The password to use for encryption
   * @returns {Promise<string>} The encrypted data as a base64 string
   */
  async function encrypt(data, password) {
    try {
      // Generate a random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      
      // Derive the encryption key
      const key = await deriveKey(password);
      
      // Convert data to buffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataBuffer
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypts data encrypted with AES-GCM
   * @param {string} encryptedData - The encrypted data as a base64 string
   * @param {string} password - The password used for encryption
   * @returns {Promise<string>} The decrypted data
   */
  async function decrypt(encryptedData, password) {
    try {
      // Convert base64 back to buffer
      const encryptedBytes = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );
      
      // Extract IV and encrypted data
      const iv = encryptedBytes.slice(0, IV_LENGTH);
      const data = encryptedBytes.slice(IV_LENGTH);
      
      // Derive the decryption key
      const key = await deriveKey(password);
      
      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );
      
      // Convert buffer back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data. The password may be incorrect.');
    }
  }
  
  /**
   * Generates a secure random string for use as an encryption key
   * @param {number} length - The desired length of the string
   * @returns {string} A random string
   */
  function generateSecureRandomString(length = 32) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  export {
    encrypt,
    decrypt,
    generateSecureRandomString
  };