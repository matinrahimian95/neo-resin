import { z } from "zod";

export const reviewSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  authorName: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد.").max(60),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(5, "متن نظر خیلی کوتاه است.").max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;