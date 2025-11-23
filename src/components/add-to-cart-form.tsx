"use client";

export function AddToCartForm({ productSlug }: { productSlug: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.alert("Sorry, cart system not available");
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input type="hidden" name="productSlug" value={productSlug} />
      <button
        type="submit"
        className="max-w-[150px] rounded-[2px] bg-accent1 px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
    </form>
  );
}
