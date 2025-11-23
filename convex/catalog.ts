import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    // Sort by name ascending for consistent ordering
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getAllCollections = query({
  args: {},
  handler: async (ctx) => {
    const collections = await ctx.db.query("collections").collect();
    // Sort by name ascending to match Drizzle behavior
    return collections.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getCategoriesByCollection = query({
  args: { collectionId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_collection_id", (q) =>
        q.eq("collection_id", args.collectionId),
      )
      .collect();
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getSubcollectionsByCategory = query({
  args: { categorySlug: v.string() },
  handler: async (ctx, args) => {
    const subcollections = await ctx.db
      .query("subcollections")
      .withIndex("by_category_slug", (q) =>
        q.eq("category_slug", args.categorySlug),
      )
      .collect();

    // Sort by name for consistent ordering
    return subcollections.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getSubcollectionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Note: We need to add a slug field to subcollections or use external_id
    // For now, let's find by name (you may need to adjust this based on your data structure)
    const subcollections = await ctx.db.query("subcollections").collect();
    return (
      subcollections.find(
        (s) => s.name.toLowerCase().replace(/\s+/g, "-") === args.slug,
      ) || null
    );
  },
});

export const getSubcategoriesByCategory = query({
  args: { categorySlug: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("subcategories"),
      _creationTime: v.number(),
      slug: v.string(),
      name: v.string(),
      subcollection_id: v.number(),
      image_url: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    // Get all subcollections for this category
    const subcollections = await ctx.db
      .query("subcollections")
      .withIndex("by_category_slug", (q) =>
        q.eq("category_slug", args.categorySlug),
      )
      .collect();

    // Get all subcategories for these subcollections
    // Limit total to 8000 to stay under 8192 array limit
    const allSubcategories: Array<{
      _id: Id<"subcategories">;
      _creationTime: number;
      slug: string;
      name: string;
      subcollection_id: number;
      image_url: string;
    }> = [];
    const maxTotal = 8000;

    for (const subcollection of subcollections) {
      if (allSubcategories.length >= maxTotal) break;

      const remaining = maxTotal - allSubcategories.length;
      const subcategories = await ctx.db
        .query("subcategories")
        .withIndex("by_subcollection_id", (q) =>
          q.eq("subcollection_id", subcollection.external_id),
        )
        .take(Math.min(1000, remaining)); // Limit per subcollection and total
      allSubcategories.push(...subcategories);
    }

    // Sort by name for consistent ordering
    return allSubcategories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const countProductsBySubcategory = query({
  args: { subcategorySlug: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Count products for a subcategory using indexed query
    // Since no subcategory has more than a few thousand, 10k limit is safe
    const products = await ctx.db
      .query("products")
      .withIndex("by_subcategory_slug", (q) =>
        q.eq("subcategory_slug", args.subcategorySlug),
      )
      .take(10000);
    return products.length;
  },
});

export const countProductsByCategory = query({
  args: { categorySlug: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Get all subcollections for this category
    const subcollections = await ctx.db
      .query("subcollections")
      .withIndex("by_category_slug", (q) =>
        q.eq("category_slug", args.categorySlug),
      )
      .collect();

    // Get all subcategories for these subcollections
    const subcategories: Array<{ slug: string }> = [];
    for (const subcollection of subcollections) {
      const subcats = await ctx.db
        .query("subcategories")
        .withIndex("by_subcollection_id", (q) =>
          q.eq("subcollection_id", subcollection.external_id),
        )
        .take(1000); // Limit per subcollection
      subcategories.push(...subcats.map((sc) => ({ slug: sc.slug })));
    }

    // Count products for all subcategories
    let totalCount = 0;
    for (const subcategory of subcategories) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_subcategory_slug", (q) =>
          q.eq("subcategory_slug", subcategory.slug),
        )
        .take(10000); // Limit per subcategory (safe since no subcategory has more than a few thousand)
      totalCount += products.length;
    }

    return totalCount;
  },
});

export const countProductsBySubcollection = query({
  args: { subcollectionId: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Get all subcategories for this subcollection
    const subcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_subcollection_id", (q) =>
        q.eq("subcollection_id", args.subcollectionId),
      )
      .take(1000);

    // Count products for all subcategories
    let totalCount = 0;
    for (const subcategory of subcategories) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_subcategory_slug", (q) =>
          q.eq("subcategory_slug", subcategory.slug),
        )
        .take(10000);
      totalCount += products.length;
    }

    return totalCount;
  },
});

export const getSubcollectionProductCounts = query({
  args: { categorySlug: v.string() },
  returns: v.record(v.string(), v.number()),
  handler: async (ctx, args) => {
    // Get all subcollections for this category
    const subcollections = await ctx.db
      .query("subcollections")
      .withIndex("by_category_slug", (q) =>
        q.eq("category_slug", args.categorySlug),
      )
      .collect();

    // Count products for each subcollection
    // Use string keys since Convex records require string keys
    const counts: Record<string, number> = {};

    for (const subcollection of subcollections) {
      // Get all subcategories for this subcollection
      const subcategories = await ctx.db
        .query("subcategories")
        .withIndex("by_subcollection_id", (q) =>
          q.eq("subcollection_id", subcollection.external_id),
        )
        .take(1000);

      // Count products for all subcategories
      let totalCount = 0;
      for (const subcategory of subcategories) {
        const products = await ctx.db
          .query("products")
          .withIndex("by_subcategory_slug", (q) =>
            q.eq("subcategory_slug", subcategory.slug),
          )
          .take(10000);
        totalCount += products.length;
      }

      // Convert number key to string for Convex record
      counts[subcollection.external_id.toString()] = totalCount;
    }

    return counts;
  },
});

export const getSubcategoriesBySubcollection = query({
  args: { subcollectionSlug: v.string() },
  handler: async (ctx, args) => {
    // First find the subcollection by slug
    const subcollections = await ctx.db.query("subcollections").collect();
    const subcollection = subcollections.find(
      (s) =>
        s.name.toLowerCase().replace(/\s+/g, "-") === args.subcollectionSlug,
    );

    if (!subcollection) return [];

    const subcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_subcollection_id", (q) =>
        q.eq("subcollection_id", subcollection.external_id),
      )
      .collect();

    // Sort by name for consistent ordering
    return subcategories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getSubcategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subcategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getProductsBySubcategory = query({
  args: { subcategorySlug: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      slug: v.string(),
      name: v.string(),
      description: v.string(),
      price: v.number(),
      subcategory_slug: v.string(),
      image_url: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    // Limit to 30,000 products for safety (products can exceed 32k limit)
    const products = await ctx.db
      .query("products")
      .withIndex("by_subcategory_slug", (q) =>
        q.eq("subcategory_slug", args.subcategorySlug),
      )
      .take(30000);

    // Sort by slug ascending to match Drizzle behavior for consistent ordering
    return products.sort((a, b) => a.slug.localeCompare(b.slug));
  },
});

export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const searchProducts = query({
  args: { searchTerm: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      slug: v.string(),
      name: v.string(),
      description: v.string(),
      price: v.number(),
      subcategory_slug: v.string(),
      image_url: v.string(),
      category_slug: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.trim().length === 0) {
      return [];
    }

    // Search products by name using full text search
    const products = await ctx.db
      .query("products")
      .withSearchIndex("search_name", (q) => q.search("name", args.searchTerm))
      .take(50); // Limit to 50 results for performance

    if (products.length === 0) {
      return [];
    }

    // Get all subcategories for the products
    const subcategorySlugs = [
      ...new Set(products.map((p) => p.subcategory_slug)),
    ];
    const subcategories = await Promise.all(
      subcategorySlugs.map((slug) =>
        ctx.db
          .query("subcategories")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique(),
      ),
    );

    // Get all subcollections for the subcategories
    const subcollectionIds = [
      ...new Set(
        subcategories
          .filter((sc) => sc !== null)
          .map((sc) => sc!.subcollection_id),
      ),
    ];
    const subcollections = await Promise.all(
      subcollectionIds.map((id) =>
        ctx.db
          .query("subcollections")
          .withIndex("by_external_id", (q) => q.eq("external_id", id))
          .first(),
      ),
    );

    // Create a map for quick lookup
    const subcategoryMap = new Map(
      subcategories.filter((sc) => sc !== null).map((sc) => [sc!.slug, sc!]),
    );
    const subcollectionMap = new Map(
      subcollections
        .filter((sc) => sc !== null)
        .map((sc) => [sc!.external_id, sc!]),
    );

    // Enrich products with category_slug
    return products
      .map((product) => {
        const subcategory = subcategoryMap.get(product.subcategory_slug);
        if (!subcategory) return null;

        const subcollection = subcollectionMap.get(
          subcategory.subcollection_id,
        );
        if (!subcollection) return null;

        return {
          ...product,
          category_slug: subcollection.category_slug,
        };
      })
      .filter((p) => p !== null) as Array<{
      _id: Id<"products">;
      _creationTime: number;
      slug: string;
      name: string;
      description: string;
      price: number;
      subcategory_slug: string;
      image_url: string;
      category_slug: string;
    }>;
  },
});

// Helper function to generate all possible routes for pre-rendering
export const getAllRoutes = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const routes = ["/"];

    const categories = await ctx.db.query("categories").collect();
    const subcollections = await ctx.db.query("subcollections").collect();
    const subcategories = await ctx.db.query("subcategories").collect();

    // Category routes
    for (const category of categories) {
      routes.push(`/${category.slug}`);

      // Subcollection routes
      const categorySubcollections = subcollections.filter(
        (s) => s.category_slug === category.slug,
      );
      for (const subcollection of categorySubcollections) {
        const subcollectionSlug = subcollection.name
          .toLowerCase()
          .replace(/\s+/g, "-");
        routes.push(`/${category.slug}/${subcollectionSlug}`);

        // Subcategory routes
        const subcollectionSubcategories = subcategories.filter(
          (s) => s.subcollection_id === subcollection.external_id,
        );
        for (const subcategory of subcollectionSubcategories) {
          routes.push(
            `/${category.slug}/${subcollectionSlug}/${subcategory.slug}`,
          );

          // Product routes - use indexed query to avoid loading all products
          // Limit to 30,000 products per subcategory for safety
          const subcategoryProducts = await ctx.db
            .query("products")
            .withIndex("by_subcategory_slug", (q) =>
              q.eq("subcategory_slug", subcategory.slug),
            )
            .take(30000);

          for (const product of subcategoryProducts) {
            routes.push(
              `/${category.slug}/${subcollectionSlug}/${subcategory.slug}/${product.slug}`,
            );
          }
        }
      }
    }

    return routes;
  },
});
