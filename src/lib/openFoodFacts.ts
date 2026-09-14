export type OffProduct = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Nutriments = Partial<
  Record<
    "energy-kcal_100g" | "proteins_100g" | "carbohydrates_100g" | "fat_100g",
    number | string
  >
>;

type OffResponse = {
  status: 0 | 1;
  product?: {
    product_name?: string;
    nutriments?: Nutriments;
  };
};

function toNumber(value: number | string | undefined): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return parsed && parsed > 0 ? Math.round(parsed * 10) / 10 : 0;
}

export async function lookupProductByBarcode(
  barcode: string,
): Promise<OffProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode,
  )}.json`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as OffResponse;
  if (data.status !== 1 || !data.product) return null;

  const name = data.product.product_name?.trim();
  if (!name) return null;

  const n = data.product.nutriments ?? {};
  return {
    name,
    calories: Math.round(toNumber(n["energy-kcal_100g"])),
    protein: toNumber(n["proteins_100g"]),
    carbs: toNumber(n["carbohydrates_100g"]),
    fat: toNumber(n["fat_100g"]),
  };
}
