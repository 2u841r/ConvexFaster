import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  categories: defineTable({
    slug: v.string(),
    name: v.string(),
    collection_id: v.number(),
    image_url: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_collection_id", ["collection_id"]),

  collections: defineTable({
    external_id: v.number(),
    name: v.string(),
    slug: v.string(),
  })
    .index("by_external_id", ["external_id"])
    .index("by_slug", ["slug"]),

  products: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    subcategory_slug: v.string(),
    image_url: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_subcategory_slug", ["subcategory_slug"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  subcollections: defineTable({
    external_id: v.number(),
    name: v.string(),
    category_slug: v.string(),
  })
    .index("by_external_id", ["external_id"])
    .index("by_category_slug", ["category_slug"]),

  subcategories: defineTable({
    slug: v.string(),
    name: v.string(),
    subcollection_id: v.number(),
    image_url: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_subcollection_id", ["subcollection_id"]),
};

export default defineSchema({
  ...applicationTables,
});
