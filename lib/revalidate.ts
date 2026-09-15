import { revalidatePath } from "next/cache";

/** Invalidate all authenticated app routes that depend on shared data. */
export function revalidateApp() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/habits");
  revalidatePath("/goal");
  revalidatePath("/food");
}
