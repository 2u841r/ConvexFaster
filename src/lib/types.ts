// Convex Product type based on schema
export type Product = {
  slug: string;
  name: string;
  description: string;
  price: string; // Price as string for compatibility with Drizzle Product type
  subcategory_slug: string;
  image_url: string | null;
};
