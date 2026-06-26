import { listActiveCategories } from "./categories.repository";

export function getActiveCategories() {
  return listActiveCategories();
}
