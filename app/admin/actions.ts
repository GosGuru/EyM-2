"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const price = Number(formData.get("price") || 0);
    const regular_price = formData.get("regular_price") ? Number(formData.get("regular_price")) : null;
    const category_slug = formData.get("category_slug") as string;
    const description = (formData.get("description") as string) || "";
    const short_description = (formData.get("short_description") as string) || "";
    const image_url = (formData.get("image_url") as string) || "";
    const sizesRaw = (formData.get("sizes") as string) || "S, M, L, XL";
    const stock = Number(formData.get("stock") || 10);
    const featured = formData.get("featured") === "on";

    if (!name || price <= 0) {
      return { success: false, error: "El nombre y precio son obligatorios" };
    }

    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const sizes = sizesRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const images = image_url ? [{ src: image_url }] : [{ src: `https://picsum.photos/seed/${slug}/600/800` }];

    const { error } = await supabase.from("products").insert({
      name,
      slug,
      price,
      regular_price,
      category_slug,
      description,
      short_description,
      images,
      sizes,
      stock,
      featured,
      active: true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/tienda");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al crear producto" };
  }
}

export async function deleteProductAction(productId: number) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").update({ active: false }).eq("id", productId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    revalidatePath("/tienda");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al desactivar producto" };
  }
}

export async function updateOrderStatusAction(orderId: number, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al actualizar pedido" };
  }
}
