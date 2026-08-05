const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").trim();
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(normalizePhone(phone));
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) {
    return "Phone number is required.";
  }

  if (!isValidPhone(phone)) {
    return "Enter a valid phone number (10–15 digits).";
  }

  return null;
}

export function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}

export function validateSignup(
  name: string,
  email: string,
  password: string,
  phone: string
): string | null {
  if (!name.trim()) {
    return "Name is required.";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return phoneError;
  }

  return validateLogin(email, password);
}

export function validateEmailOnly(email: string): string | null {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  return null;
}
