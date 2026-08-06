const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.replace(/[\s\-()]/g, "").trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  return trimmed.replace(/\D/g, "");
}

/** Build E.164 from dial code (+91) and national digits. */
export function composeE164Phone(
  dialCode: string,
  nationalNumber: string
): string {
  const dialDigits = dialCode.replace(/\D/g, "");
  const nationalDigits = nationalNumber.replace(/\D/g, "");
  if (!dialDigits || !nationalDigits) {
    return "";
  }
  return `+${dialDigits}${nationalDigits}`;
}

export function isValidPhone(phone: string): boolean {
  return E164_REGEX.test(normalizePhone(phone));
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) {
    return "Phone number is required.";
  }

  const normalized = normalizePhone(phone);
  if (!normalized.startsWith("+")) {
    return "Select a country code for your phone number.";
  }

  if (!isValidPhone(normalized)) {
    return "Enter a valid phone number with country code.";
  }

  return null;
}

export function validateNationalNumber(nationalNumber: string): string | null {
  const digits = nationalNumber.replace(/\D/g, "");
  if (!digits) {
    return "Phone number is required.";
  }
  if (digits.length < 6 || digits.length > 12) {
    return "Enter a valid local phone number.";
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

export function validateDateOfBirth(dob: string): string | null {
  const trimmed = dob.trim();
  if (!trimmed) {
    return "Date of birth is required.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "Use date format YYYY-MM-DD.";
  }

  const [y, m, d] = trimmed.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return "Enter a valid date of birth.";
  }

  const now = new Date();
  if (date.getTime() > Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) {
    return "Date of birth cannot be in the future.";
  }

  if (y < 1900) {
    return "Enter a realistic date of birth.";
  }

  // Must be at least 13
  const thirteen = new Date(
    Date.UTC(now.getUTCFullYear() - 13, now.getUTCMonth(), now.getUTCDate())
  );
  if (date.getTime() > thirteen.getTime()) {
    return "You must be at least 13 years old.";
  }

  return null;
}

export function validateBirthPlace(place: string): string | null {
  if (!place.trim()) {
    return "Place of birth is required.";
  }
  if (place.trim().length < 2) {
    return "Enter a valid place of birth.";
  }
  if (place.trim().length > 80) {
    return "Place of birth is too long.";
  }
  return null;
}

export function validateSignup(
  name: string,
  email: string,
  password: string,
  phone: string,
  dateOfBirth?: string,
  birthPlace?: string
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

  if (dateOfBirth !== undefined) {
    const dobError = validateDateOfBirth(dateOfBirth);
    if (dobError) {
      return dobError;
    }
  }

  if (birthPlace !== undefined) {
    const placeError = validateBirthPlace(birthPlace);
    if (placeError) {
      return placeError;
    }
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
