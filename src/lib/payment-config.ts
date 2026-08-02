// اطلاعات عمومی پرداخت (غیرمحرمانه). کلیدهای درگاه هرگز اینجا قرار نمی‌گیرند.
export const CARD_TRANSFER = {
  cardNumber: "6219 8618 1108 0430",
  cardNumberRaw: "6219861811080430",
  holder: "زینب رحیمیان",
  bank: "بانک سامان",
} as const;

export type PaymentMethod = "online" | "card_transfer";

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "در انتظار پرداخت",
  paid: "پرداخت موفق",
  failed: "پرداخت ناموفق",
  awaiting_verification: "در انتظار تأیید پرداخت",
};
