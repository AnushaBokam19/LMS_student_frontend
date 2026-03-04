/**
 * Auth constants aligned with backend (authController.js).
 * Keep in sync to avoid "unknown column" / validation mismatches.
 */

export const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
];

export const ROLE_VALUES = ROLES.map((r) => r.value);

/** Fields the register API expects (must match backend users table and authController) */
export const REGISTER_FIELDS = ['name', 'email', 'password', 'role', 'phone_no'];

/**
 * Validates and normalizes register payload before sending to API.
 * Returns { valid: true, data } or { valid: false, error }.
 */
export function validateRegisterPayload({ name, email, password, role, phone_no: phoneNo }) {
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedPassword = typeof password === 'string' ? password : '';
  const trimmedPhone = typeof phoneNo === 'string' ? phoneNo.trim() : '';

  if (!trimmedName) return { valid: false, error: 'Name is required.' };
  if (!trimmedEmail) return { valid: false, error: 'Email is required.' };
  if (!trimmedPassword) return { valid: false, error: 'Password is required.' };
  if (trimmedPassword.length < 6) return { valid: false, error: 'Password must be at least 6 characters.' };
  if (!role || !ROLE_VALUES.includes(role)) {
    return { valid: false, error: 'Please select a valid role (student, instructor, or admin).' };
  }

  return {
    valid: true,
    data: { name: trimmedName, email: trimmedEmail, password: trimmedPassword, role, phone_no: trimmedPhone },
  };
}
