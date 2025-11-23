import { Link } from "@/components/ui/link";
import {
  getCollections,
  getCategories,
  getDataCounts,
} from "@/lib/convex-server";
import Image from "next/image";

export default async function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [collections, categories, counts] = await Promise.all([
    getCollections(),
    getCategories(),
    getDataCounts(),
  ]);

  // Sort collections alphabetically
  const sortedCollections = [...collections].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Group categories by collection
  const collectionsWithCategories = sortedCollections.map((collection) => ({
    ...collection,
    categories: categories.filter(
      (cat) => cat.collection_id === collection.external_id,
    ),
  }));

  let imageCount = 0;

  return (
    <div className="w-full p-4">
      <div className="mb-2 w-full flex-grow border-b-[1px] border-accent1 text-sm font-semibold text-black">
        {/* {counts.products.toLocaleString()}  */}
        Explore 1,008,768 products
      </div>
      {collectionsWithCategories.map((collection) => (
        <div key={collection._id}>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                prefetch={true}
                key={category._id}
                className="flex w-[125px] flex-col items-center text-center"
                href={`/products/${category.slug}`}
              >
                <Image
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
                  decoding="sync"
                  src={category.image_url ?? "/placeholder.svg"}
                  alt={`A small picture of ${category.name}`}
                  className="mb-2 h-14 w-14 border hover:bg-accent2"
                  width={48}
                  height={48}
                  quality={65}
                />
                <span className="text-xs">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
