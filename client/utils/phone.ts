export function maskPhoneNumber(phoneNumber?: string | null): string {
    if (!phoneNumber) {
        return 'Phone unavailable';
    }

    const visibleCharacters = phoneNumber.replace(/\D/g, '');

    if (visibleCharacters.length < 4) {
        return phoneNumber.replace(/\d/g, '*');
    }

    const firstTwo = visibleCharacters.slice(0, 2);
    const lastTwo = visibleCharacters.slice(-2);
    const middleMask = '*'.repeat(Math.max(visibleCharacters.length - 4, 2));

    return `${firstTwo}${middleMask}${lastTwo}`;
}
