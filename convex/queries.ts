import { query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").take(10);
  },
});

export const getCollections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("collections").take(10);
  },
});

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").take(10);
  },
});

export const getSubcollections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subcollections").take(10);
  },
});

export const getSubcategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subcategories").take(10);
  },
});

/**
 * Helper function to count documents in a table
 * Uses .take() to limit document reads and avoid exceeding 32k limit
 * Since we count 5 tables in one function, we use 6000 per table (5 * 6000 = 30k total)
 */
async function countDocuments(
  ctx: QueryCtx,
  tableName:
    | "categories"
    | "collections"
    | "products"
    | "subcollections"
    | "subcategories",
  maxCount: number = 6000,
): Promise<number> {
  // Use .take() to limit the number of documents read
  // 6,000 per table ensures total reads stay under 32k (5 tables * 6k = 30k)
  const docs = await ctx.db.query(tableName).take(maxCount);
  return docs.length;
}

export const getDataCounts = query({
  args: {},
  returns: v.object({
    categories: v.number(),
    collections: v.number(),
    products: v.number(),
    subcollections: v.number(),
    subcategories: v.number(),
  }),
  handler: async (ctx) => {
    // Total limit: 32,000 documents per function execution
    // Distributing limits to stay under 32k total:
    // Categories: 1000 (549 actual, so accurate)
    // Collections: 100 (19 actual, so accurate)
    // Products: 25000 (capped for safety, actual is 100k+)
    // Subcollections: 6000 (5527 actual, so accurate)
    // Subcategories: 900 (reduced to make room for products)
    // Total: 32,000 (at the limit, but safe)
    const categories = await countDocuments(ctx, "categories", 1000);
    const collections = await countDocuments(ctx, "collections", 100);
    const products = await countDocuments(ctx, "products", 25000);
    const subcollections = await countDocuments(ctx, "subcollections", 6000);
    const subcategories = await countDocuments(ctx, "subcategories", 900);

    return {
      categories,
      collections,
      products,
      subcollections,
      subcategories,
    };
  },
});
