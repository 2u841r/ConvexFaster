import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const dynamic = "force-dynamic";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ImageInfo {
  srcset?: string | null;
  sizes?: string | null;
  src: string;
  alt?: string | null;
  loading?: string | null;
}

async function getImagesForPath(path: string): Promise<ImageInfo[]> {
  const segments = path.split("/").filter(Boolean);
  const images: ImageInfo[] = [];

  try {
    // Home page - get all categories
    if (
      segments.length === 0 ||
      (segments.length === 1 && segments[0] === "")
    ) {
      const categories = await client.query(api.catalog.getAllCategories, {});
      for (const category of categories) {
        if (category.image_url) {
          images.push({
            src: category.image_url,
            alt: category.name,
            loading: "lazy",
          });
        }
      }
      return images;
    }

    // /products/[category]
    if (segments.length === 2 && segments[0] === "products") {
      const categorySlug = decodeURIComponent(segments[1]);
      const category = await client.query(api.catalog.getCategoryBySlug, {
        slug: categorySlug,
      });

      if (category) {
        // Category image
        if (category.image_url) {
          images.push({
            src: category.image_url,
            alt: category.name,
            loading: "eager",
          });
        }

        // Subcategory images
        const subcategories = await client.query(
          api.catalog.getSubcategoriesByCategory,
          {
            categorySlug,
          },
        );
        for (const subcategory of subcategories) {
          if (subcategory.image_url) {
            images.push({
              src: subcategory.image_url,
              alt: subcategory.name,
              loading: "lazy",
            });
          }
        }
      }
      return images;
    }

    // /products/[category]/[subcategory]
    if (segments.length === 3 && segments[0] === "products") {
      const subcategorySlug = decodeURIComponent(segments[2]);

      const subcategory = await client.query(api.catalog.getSubcategoryBySlug, {
        slug: subcategorySlug,
      });

      if (subcategory) {
        // Subcategory image
        if (subcategory.image_url) {
          images.push({
            src: subcategory.image_url,
            alt: subcategory.name,
            loading: "eager",
          });
        }

        // Product images
        const products = await client.query(
          api.catalog.getProductsBySubcategory,
          {
            subcategorySlug,
          },
        );
        for (const product of products) {
          if (product.image_url) {
            images.push({
              src: product.image_url,
              alt: product.name,
              loading: "lazy",
            });
          }
        }
      }
      return images;
    }

    // /products/[category]/[subcategory]/[product]
    if (segments.length === 4 && segments[0] === "products") {
      const subcategorySlug = decodeURIComponent(segments[2]);
      const productSlug = decodeURIComponent(segments[3]);

      const product = await client.query(api.catalog.getProductBySlug, {
        slug: productSlug,
      });

      if (product) {
        // Main product image
        if (product.image_url) {
          images.push({
            src: product.image_url,
            alt: product.name,
            loading: "eager",
          });
        }

        // Related product images
        const relatedProducts = await client.query(
          api.catalog.getProductsBySubcategory,
          {
            subcategorySlug,
          },
        );
        for (const relatedProduct of relatedProducts) {
          if (relatedProduct.image_url && relatedProduct.slug !== productSlug) {
            images.push({
              src: relatedProduct.image_url,
              alt: relatedProduct.name,
              loading: "lazy",
            });
          }
        }
      }
      return images;
    }

    // /[collection] - collection page
    if (segments.length === 1) {
      const collectionSlug = decodeURIComponent(segments[0]);
      const collections = await client.query(api.catalog.getAllCollections, {});
      const collection = collections.find((c) => c.slug === collectionSlug);

      if (collection) {
        const categories = await client.query(api.catalog.getAllCategories, {});
        const collectionCategories = categories.filter(
          (cat) => cat.collection_id === collection.external_id,
        );

        for (const category of collectionCategories) {
          if (category.image_url) {
            images.push({
              src: category.image_url,
              alt: category.name,
              loading: "lazy",
            });
          }
        }
      }
      return images;
    }
  } catch (error) {
    console.error("Error fetching images from Convex:", error);
    return [];
  }

  return images;
}

export async function GET(
  _: NextRequest,
  { params }: { params: { rest: string[] } },
) {
  const pathSegments = await params;
  const href = pathSegments.rest.join("/");

  if (!href) {
    return new Response("Missing url parameter", { status: 400 });
  }

  const images = await getImagesForPath(href);

  return NextResponse.json(
    { images },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
