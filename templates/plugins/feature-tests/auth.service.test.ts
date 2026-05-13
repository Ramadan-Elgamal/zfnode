import { authService } from '../src/services/auth.service.js';

describe('🔐 Auth Cryptographic Service (Unit Suite)', () => {
  const plainPassword = 'SuperSecretEnterprisePassword123!';
  let hashedPassword = '';

  test('should securely hash a plaintext string', async () => {
    hashedPassword = await authService.hashPassword(plainPassword);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
    expect(hashedPassword.startsWith('$2b$')).toBe(true);
  });

  test('should successfully verify matching password strings', async () => {
    const isValid = await authService.verifyPassword(plainPassword, hashedPassword);
    expect(isValid).toBe(true);
  });

  test('should reject incorrect password attempts cleanly', async () => {
    const isValid = await authService.verifyPassword('WrongPassword!', hashedPassword);
    expect(isValid).toBe(false);
  });

  test('should generate a valid cryptographic JWT structure', () => {
    const token = authService.generateToken('test_user_uuid_007');
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3); // Header.Payload.Signature
  });
});