/**
 * Fee calculation per Adresles_Business.md Section 1.8
 * fee% = 5 - (2.5 × (importe - 10) / 90) for 10 < amount < 100
 * Min 2.5%, Max 5%
 */
export function calculateFee(amount: number): { percentage: number; amount: number } {
  let percentage: number;
  if (amount <= 10) {
    percentage = 5;
  } else if (amount >= 100) {
    percentage = 2.5;
  } else {
    percentage = 5 - (2.5 * (amount - 10)) / 90;
  }
  const feeAmount = (amount * percentage) / 100;
  return { percentage, amount: Math.round(feeAmount * 100) / 100 };
}
