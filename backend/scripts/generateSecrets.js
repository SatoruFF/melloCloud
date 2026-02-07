#!/usr/bin/env node
/**
 * Утилита для генерации криптографически стойких секретных ключей
 * 
 * Использование:
 *   node scripts/generateSecrets.js
 * 
 * Генерирует безопасные ключи для:
 * - SECRET_KEY (64 символа)
 * - ACCESS_SECRET_KEY (64 символа)
 * - REFRESH_SECRET_KEY (64 символа)
 * - MESSAGE_ENCRYPTION_KEY (32 символа)
 * - ADMIN_SESSION_SECRET (64 символа)
 */

import crypto from 'crypto';

/**
 * Генерирует криптографически стойкий случайный ключ
 * @param {number} length - Длина ключа в байтах
 * @returns {string} - Ключ в base64url формате (безопасный для URL)
 */
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Генерирует hex ключ (для MESSAGE_ENCRYPTION_KEY)
 * @param {number} length - Длина в байтах
 * @returns {string} - Ключ в hex формате
 */
function generateHexKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n🔐 Генерация криптографически стойких секретных ключей...\n');
console.log('━'.repeat(70));
console.log('\n📋 Скопируйте эти значения в ваш .env файл:\n');
console.log('━'.repeat(70));
console.log();

const secrets = {
  SECRET_KEY: generateSecureKey(48), // 64 символа в base64url
  ACCESS_SECRET_KEY: generateSecureKey(48),
  REFRESH_SECRET_KEY: generateSecureKey(48),
  MESSAGE_ENCRYPTION_KEY: generateHexKey(32), // 64 hex символа
  ADMIN_SESSION_SECRET: generateSecureKey(48),
};

// Выводим в формате .env
for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}="${value}"`);
}

console.log();
console.log('━'.repeat(70));
console.log('\n⚠️  ВАЖНО:');
console.log('   1. Храните эти ключи в безопасности');
console.log('   2. НЕ коммитьте их в Git');
console.log('   3. Используйте разные ключи для dev/prod');
console.log('   4. После замены ключей все пользователи будут разлогинены');
console.log('   5. Пароли НЕ пострадают (они хэшируются scrypt, не зависят от этих ключей)');
console.log('\n✅ Сила ключей:');
console.log(`   - SECRET_KEY, *_SECRET_KEY, ADMIN_SESSION_SECRET: ${secrets.SECRET_KEY.length} символов (${48 * 8} бит)`);
console.log(`   - MESSAGE_ENCRYPTION_KEY: ${secrets.MESSAGE_ENCRYPTION_KEY.length} символов (${32 * 8} бит)`);
console.log();
console.log('🔒 Безопасность:');
console.log('   - Используется crypto.randomBytes (CSPRNG)');
console.log('   - base64url кодировка (безопасна для URL)');
console.log('   - Соответствует стандартам NIST');
console.log();
console.log('━'.repeat(70));
console.log();
