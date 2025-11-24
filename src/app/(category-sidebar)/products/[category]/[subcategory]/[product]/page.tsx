import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductLink } from "@/components/ui/product-card";
import { AddToCartForm } from "@/components/add-to-cart-form";
import {
  getProductBySlug,
  getProductsBySubcategory,
} from "@/lib/convex-server";

export default async function Page(props: {
  params: Promise<{
    product: string;
    subcategory: string;
    category: string;
  }>;
}) {
  const params = await props.params;
  const productSlug = decodeURIComponent(params.product);
  const subcategorySlug = decodeURIComponent(params.subcategory);
  const categorySlug = decodeURIComponent(params.category);

  const [product, relatedProducts] = await Promise.all([
    getProductBySlug(productSlug),
    getProductsBySubcategory(subcategorySlug),
  ]);

  if (!product) {
    return notFound();
  }

  const currentProductIndex = relatedProducts.findIndex(
    (p) => p.slug === product.slug,
  );
  const related = [
    ...relatedProducts.slice(currentProductIndex + 1),
    ...relatedProducts.slice(0, currentProductIndex),
  ];

  return (
    <div className="container p-4">
      <h1 className="border-t-2 pt-1 text-xl font-bold text-accent1">
        {product.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Image
            loading="eager"
            decoding="sync"
            src={product.image_url ?? "/placeholder.svg?height=64&width=64"}
            alt={`A small picture of ${product.name}`}
            height={256}
            quality={80}
            width={256}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
          />
          <p className="flex-grow text-base">{product.description}</p>
        </div>
        <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
        <AddToCartForm productSlug={product.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && (
          <h2 className="text-lg font-bold text-accent1">
            Explore more products
          </h2>
        )}
        <div className="flex flex-row flex-wrap gap-2">
          {related?.map((relatedProduct) => (
            <ProductLink
              key={relatedProduct._id}
              loading="lazy"
              category_slug={categorySlug}
              subcategory_slug={subcategorySlug}
              product={{
                slug: relatedProduct.slug,
                name: relatedProduct.name,
                description: relatedProduct.description,
                price: relatedProduct.price.toString(),
                subcategory_slug: relatedProduct.subcategory_slug,
                image_url: relatedProduct.image_url ?? null,
              }}
              imageUrl={relatedProduct.image_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
