import { apiClient } from "@/lib/apiClient";
import type {
  Category,
  ProductFormValues,
  ProductImage,
  ProductStatus,
  SellerProduct,
  SellerProfile,
} from "@/types/api";

export type SellerProfileValues = {
  commercial_name?: string;
  phone?: string;
  address?: string;
  business_description?: string;
};

export type SellerProductFilters = {
  search?: string;
  status?: ProductStatus | "";
  category_id?: string;
};

function toQueryString(filters: SellerProductFilters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.category_id) {
    params.set("category_id", filters.category_id);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getCategories() {
  return apiClient<{ categories: Category[] }>("/api/categories");
}

export function getSellerProfile(token: string) {
  return apiClient<{ seller: SellerProfile }>("/api/sellers/me", { token });
}

export function updateSellerProfile(
  token: string,
  values: SellerProfileValues,
) {
  return apiClient<{ seller: SellerProfile }>("/api/sellers/me", {
    method: "PATCH",
    token,
    body: values,
  });
}

export function getSellerProducts(
  token: string,
  filters: SellerProductFilters = {},
) {
  return apiClient<{ products: SellerProduct[] }>(
    `/api/products/me${toQueryString(filters)}`,
    { token },
  );
}

export function getSellerProduct(token: string, productId: string) {
  return apiClient<{ product: SellerProduct }>(`/api/products/me/${productId}`, {
    token,
  });
}

export function createSellerProduct(token: string, values: ProductFormValues) {
  return apiClient<{ product: SellerProduct }>("/api/products", {
    method: "POST",
    token,
    body: values,
  });
}

export function updateSellerProduct(
  token: string,
  productId: string,
  values: ProductFormValues,
) {
  return apiClient<{ product: SellerProduct }>(`/api/products/me/${productId}`, {
    method: "PATCH",
    token,
    body: values,
  });
}

export function getProductImages(token: string, productId: string) {
  return apiClient<{ images: ProductImage[] }>(
    `/api/products/me/${productId}/images`,
    { token },
  );
}

export type ProductImageValues = {
  image_url: string;
  alt_text?: string;
  position?: number;
  is_main?: boolean;
};

export function addProductImage(
  token: string,
  productId: string,
  values: ProductImageValues,
) {
  return apiClient<{ image: ProductImage }>(
    `/api/products/me/${productId}/images`,
    {
      method: "POST",
      token,
      body: values,
    },
  );
}

export function setProductImageMain(
  token: string,
  productId: string,
  imageId: string,
) {
  return apiClient<{ image: ProductImage }>(
    `/api/products/me/${productId}/images/${imageId}/main`,
    {
      method: "PATCH",
      token,
    },
  );
}

export function deleteProductImage(
  token: string,
  productId: string,
  imageId: string,
) {
  return apiClient<{ success: boolean }>(
    `/api/products/me/${productId}/images/${imageId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
