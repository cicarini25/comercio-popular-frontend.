/**
 * Format currency to Brazilian Real standard (pt-BR)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Validates Brazilian CPF with the official checksum algorithm
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Reject known invalid sequences (e.g. 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // First digit validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9), 10)) return false;

  // Second digit validation
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10), 10)) return false;

  return true;
}

/**
 * Masks a CPF input string (000.000.000-00)
 */
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Masks a Brazilian phone number ((00) 00000-0000)
 */
export function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/**
 * Masks a CEP (00000-000)
 */
export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})/, '$1-$2');
}

/**
 * Generates an authentic simulated PIX Copia e Cola EMV payload
 */
export function generatePixPayload(amount: number, txid: string): string {
  const cleanAmount = amount.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136comerciopopular-pay@bcb.gov.br520400005303986540${cleanAmount.length < 10 ? '0' + cleanAmount.length : cleanAmount}${cleanAmount}5802BR5920COMERCIO POPULAR LTDA6009SAO PAULO62170513CP-${txid.slice(0, 8)}6304`;
}

/**
 * Freight options simulator based on Brazilian postal code (CEP)
 */
export function simulateFreight(cep: string) {
  const clean = cep.replace(/\D/g, '');
  if (clean.length < 8) return [];

  // Regional calculation simulation
  const prefix = parseInt(clean.substring(0, 2), 10);
  const isSudeste = prefix >= 1 && prefix <= 39;

  return [
    {
      id: 'econ',
      name: 'Frete Econômico (Parceiro)',
      days: isSudeste ? 3 : 6,
      price: isSudeste ? 12.90 : 19.90,
      badge: 'Mais barato'
    },
    {
      id: 'expresso',
      name: 'Sedex / Envio Expresso',
      days: isSudeste ? 1 : 3,
      price: isSudeste ? 24.50 : 38.90,
      badge: 'Mais rápido'
    }
  ];
}
