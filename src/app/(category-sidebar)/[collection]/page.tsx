import { Link } from "@/components/ui/link";
import { getCollections, getCategories } from "@/lib/convex-server";
import Image from "next/image";

export default async function Home(props: {
  params: Promise<{
    collection: string;
  }>;
}) {
  const params = await props.params;
  const collectionSlug = decodeURIComponent(params.collection);

  const [collections, categories] = await Promise.all([
    getCollections(),
    getCategories(),
  ]);

  const collection = collections.find((c) => c.slug === collectionSlug);
  const collectionCategories = collection
    ? categories.filter((cat) => cat.collection_id === collection.external_id)
    : [];

  if (!collection) {
    return <div>Collection not found</div>;
  }

  let imageCount = 0;

  return (
    <div className="w-full p-4">
      <div key={collection._id}>
        <h2 className="text-xl font-semibold">{collection.name}</h2>
        <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
          {collectionCategories.map((category) => (
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
    </div>
  );
}
