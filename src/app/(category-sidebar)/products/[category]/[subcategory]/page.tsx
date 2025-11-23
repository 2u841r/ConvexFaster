import { notFound } from "next/navigation";
import { ProductLink } from "@/components/ui/product-card";
import type { Metadata } from "next";
import {
  getSubcategoryBySlug,
  getProductsBySubcategory,
  countProductsBySubcategory,
} from "@/lib/convex-server";

export async function generateMetadata(props: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { subcategory: subcategoryParam } = await props.params;
  const urlDecodedSubcategory = decodeURIComponent(subcategoryParam);

  const [subcategory, subcategoryProductCount] = await Promise.all([
    getSubcategoryBySlug(urlDecodedSubcategory),
    countProductsBySubcategory(urlDecodedSubcategory),
  ]);

  if (!subcategory) {
    return notFound();
  }

  const description =
    subcategoryProductCount !== undefined && subcategoryProductCount > 0
      ? `Choose from over ${subcategoryProductCount - 1} products in ${subcategory.name}. In stock and ready to ship.`
      : undefined;

  return {
    openGraph: { title: subcategory.name, description },
  };
}

export default async function Page(props: {
  params: Promise<{
    subcategory: string;
    category: string;
  }>;
}) {
  const { subcategory, category } = await props.params;
  const urlDecodedSubcategory = decodeURIComponent(subcategory);
  const [products, countRes] = await Promise.all([
    getProductsBySubcategory(urlDecodedSubcategory),
    countProductsBySubcategory(urlDecodedSubcategory),
  ]);

  if (!products || products.length === 0) {
    return notFound();
  }

  const finalCount = countRes ?? products.length;

  return (
    <div className="container mx-auto p-4">
      {finalCount > 0 ? (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      ) : (
        <p>No products for this subcategory</p>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {products.map((product) => (
          <ProductLink
            key={product._id}
            loading="eager"
            category_slug={category}
            subcategory_slug={subcategory}
            product={{
              slug: product.slug,
              name: product.name,
              description: product.description,
              price: product.price.toString(),
              subcategory_slug: product.subcategory_slug,
              image_url: product.image_url ?? null,
            }}
            imageUrl={product.image_url}
          />
        ))}
      </div>
    </div>
  );
}
