import { searchProducts } from "@/lib/convex-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // format is /api/search?q=term
  const searchTerm = request.nextUrl.searchParams.get("q");
  if (!searchTerm || !searchTerm.length) {
    return Response.json([]);
  }

  const results = await searchProducts(searchTerm);

  const searchResults: ProductSearchResult = results.map((product) => {
    // The href format is: /products/${categorySlug}/${subcategorySlug}/${product.slug}
    const href = `/products/${product.category_slug}/${product.subcategory_slug}/${product.slug}`;
    return {
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      subcategory_slug: product.subcategory_slug,
      image_url: product.image_url,
      href,
    };
  });

  const response = Response.json(searchResults);
  // cache for 10 minutes
  response.headers.set("Cache-Control", "public, max-age=600");
  return response;
}

export type ProductSearchResult = {
  href: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string;
  price: string;
  subcategory_slug: string;
}[];
