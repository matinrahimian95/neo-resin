import { z } from "zod";

export const cartLineSchema = z.object({
  id: z.string().min(1).max(80),
  qty: z.number().int().min(1).max(50),
  size: z.string().max(40).optional(),
});

export const customerSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(20),
  address: z.string().trim().min(5).max(600),
  note: z.string().trim().max(600).optional().or(z.literal("")),
  lines: z.array(cartLineSchema).min(1).max(50),
});

export const cardOrderSchema = customerSchema.extend({
  trackingNumber: z.string().trim().min(4).max(60),
  receipt: z.object({
    name: z.string().max(200),
    type: z.string().max(100),
    // data URL / base64 محتوای تصویر رسید
    base64: z.string().min(100).max(8_000_000),
  }),
});

export const verifySchema = z.object({
  authority: z.string().trim().min(5).max(120),
  status: z.string().trim().max(20),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CardOrderInput = z.infer<typeof cardOrderSchema>;
