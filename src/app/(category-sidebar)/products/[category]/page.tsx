import Image from "next/image";
import { Link } from "@/components/ui/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getSubcollectionsByCategory,
  getSubcategoriesByCategory,
  countProductsByCategory,
  getSubcollectionProductCounts,
} from "@/lib/convex-server";

export default async function Page(props: {
  params: Promise<{
    category: string;
  }>;
}) {
  const params = await props.params;
  const categorySlug = decodeURIComponent(params.category);

  const [
    category,
    subcollections,
    subcategories,
    categoryProductCount,
    subcollectionProductCounts,
  ] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcollectionsByCategory(categorySlug),
    getSubcategoriesByCategory(categorySlug),
    countProductsByCategory(categorySlug),
    getSubcollectionProductCounts(categorySlug),
  ]);

  if (!category) {
    return notFound();
  }

  // Group subcategories by subcollection
  const subcollectionsWithSubcategories = subcollections.map(
    (subcollection) => {
      const subcats = subcategories.filter(
        (subcat) => subcat.subcollection_id === subcollection.external_id,
      );
      return {
        ...subcollection,
        subcategories: subcats,
      };
    },
  );

  return (
    <div className="container p-4">
      {categoryProductCount > 0 && (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {categoryProductCount}{" "}
          {categoryProductCount === 1 ? "Product" : "Products"}
        </h1>
      )}
      <div className="space-y-4">
        {subcollectionsWithSubcategories.map((subcollection) => {
          const subcategoryCount = subcollection.subcategories.length;

          return (
            <div key={subcollection._id}>
              <h2 className="mb-2 border-b-2 text-lg font-semibold">
                {subcollection.name}
                {subcategoryCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({subcategoryCount}{" "}
                    {subcategoryCount === 1 ? "subcategory" : "subcategories"})
                    {subcollectionProductCounts[
                      subcollection.external_id.toString()
                    ] !== undefined && (
                      <span className="ml-2">
                        •{" "}
                        {
                          subcollectionProductCounts[
                            subcollection.external_id.toString()
                          ]
                        }{" "}
                        products
                      </span>
                    )}
                  </span>
                )}
              </h2>
              <div className="flex flex-row flex-wrap gap-2">
                {subcollection.subcategories.map((subcategory) => (
                  <Link
                    prefetch={true}
                    key={subcategory._id}
                    className="group flex h-full w-full flex-row gap-2 border px-4 py-2 hover:bg-gray-100 sm:w-[200px]"
                    href={`/products/${categorySlug}/${subcategory.slug}`}
                  >
                    <div className="py-2">
                      <Image
                        loading="eager"
                        decoding="sync"
                        src={subcategory.image_url ?? "/placeholder.svg"}
                        alt={`A small picture of ${subcategory.name}`}
                        width={48}
                        height={48}
                        quality={65}
                        className="h-12 w-12 flex-shrink-0 object-cover"
                      />
                    </div>
                    <div className="flex h-16 flex-grow flex-col items-start py-2">
                      <div className="text-sm font-medium text-gray-700 group-hover:underline">
                        {subcategory.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
