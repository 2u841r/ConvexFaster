import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getCollections() {
  return await client.query(api.catalog.getAllCollections, {});
}

export async function getCategories() {
  return await client.query(api.catalog.getAllCategories, {});
}

export async function getCategoryBySlug(slug: string) {
  return await client.query(api.catalog.getCategoryBySlug, { slug });
}

export async function getSubcollectionsByCategory(categorySlug: string) {
  return await client.query(api.catalog.getSubcollectionsByCategory, {
    categorySlug,
  });
}

export async function getSubcategoriesByCategory(categorySlug: string) {
  return await client.query(api.catalog.getSubcategoriesByCategory, {
    categorySlug,
  });
}

export async function getSubcategoryBySlug(slug: string) {
  return await client.query(api.catalog.getSubcategoryBySlug, { slug });
}

export async function getProductsBySubcategory(subcategorySlug: string) {
  return await client.query(api.catalog.getProductsBySubcategory, {
    subcategorySlug,
  });
}

export async function getProductBySlug(slug: string) {
  return await client.query(api.catalog.getProductBySlug, { slug });
}

export async function getDataCounts() {
  return await client.query(api.queries.getDataCounts, {});
}

export async function countProductsByCategory(categorySlug: string) {
  return await client.query(api.catalog.countProductsByCategory, {
    categorySlug,
  });
}

export async function countProductsBySubcategory(subcategorySlug: string) {
  return await client.query(api.catalog.countProductsBySubcategory, {
    subcategorySlug,
  });
}

export async function getSubcollectionProductCounts(categorySlug: string) {
  return await client.query(api.catalog.getSubcollectionProductCounts, {
    categorySlug,
  });
}

export async function searchProducts(searchTerm: string) {
  return await client.query(api.catalog.searchProducts, { searchTerm });
}
