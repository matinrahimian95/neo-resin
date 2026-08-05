import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { reviewSchema } from "./catalog.schema";
import { fetchProduct, fetchProducts, insertReview } from "./catalog.server";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => fetchProducts());

export const getProductDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 80) }))
  .handler(async ({ data }) => fetchProduct(data.slug));

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reviewSchema.parse(data))
  .handler(async ({ data }) => insertReview(data));

export const productsQueryOptions = () =>
  queryOptions({ queryKey: ["products"], queryFn: () => listProducts(), staleTime: 60_000 });

export const productDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductDetail({ data: { slug } }),
  });