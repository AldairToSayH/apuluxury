export type UserRole = "buyer" | "seller" | "admin";

export type ApiUser = {
  id: string;
  email: string;
  avatarUrl: string | null;
  authProvider: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
};

export type BuyerProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerProfile = {
  id: string;
  userId: string;
  tenantId: string;
  commercialName: string;
  slug: string;
  ruc: string | null;
  phone: string | null;
  address: string | null;
  businessDescription: string | null;
  validationStatus: "pending" | "approved" | "rejected" | "suspended";
  createdAt: string;
  updatedAt: string;
};

export type SellerValidationStatus = SellerProfile["validationStatus"];

export type StoreProfile = {
  id: string;
  sellerId: string | null;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: ApiUser;
  buyer?: BuyerProfile;
  seller?: SellerProfile;
  store?: StoreProfile;
  token: string;
};

export type MeResponse = {
  user: ApiUser;
  buyer?: BuyerProfile;
  seller?: SellerProfile;
  store?: StoreProfile;
};

export type CatalogProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  sellerId: string;
  commercialName: string;
  sellerSlug: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: "active";
  mainImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: string;
};

export type CatalogProductDetail = CatalogProduct & {
  images: CatalogProductImage[];
};

export type PublicStoreSampleProduct = {
  name: string;
  slug: string;
  mainImageUrl: string | null;
  price: number;
};

export type PublicStore = {
  id: string;
  commercialName: string;
  slug: string;
  subdomain: string;
  businessDescription: string | null;
  phone: string | null;
  createdAt: string;
  productCount: number;
  sampleProducts: PublicStoreSampleProduct[];
};

export type PublicStoreProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  mainImageUrl: string | null;
  createdAt: string;
};

export type PublicStoreDetail = PublicStore & {
  products: PublicStoreProduct[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type ProductStatus = "draft" | "active" | "inactive" | "rejected";

export type SellerProduct = {
  id: string;
  tenantId: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  tenantId: string;
  sellerId: string;
  imageUrl: string;
  storagePath: string | null;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: string;
};

export type ProductFormValues = {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  material?: string;
  color?: string;
  size?: string;
  status: "draft" | "active" | "inactive";
};

export type CartItem = {
  cartItemId: string;
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  unitPriceAtAdded: number;
  quantity: number;
  subtotal: number;
  sellerId: string;
  commercialName: string;
  sellerSlug: string;
  categoryId: string;
  categoryName: string;
  productStatus: ProductStatus;
  mainImageUrl?: string | null;
  imageUrl?: string | null;
};

export type Cart = {
  id: string;
  buyerId: string;
  status: "active" | "converted" | "abandoned";
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type SellerOrderStatus =
  | "pending"
  | "in_preparation"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CreateOrderPayload = {
  delivery_full_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_reference?: string;
};

export type SellerOrderSummary = {
  id: string;
  orderId: string;
  tenantId: string;
  sellerId: string;
  sellerCommercialName?: string;
  sellerSlug?: string;
  orderCode?: string;
  orderStatus?: OrderStatus;
  status: SellerOrderStatus;
  subtotalAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  sellerOrderId: string;
  productId: string;
  tenantId: string;
  sellerId: string;
  productName: string;
  productSlug: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
};

export type OrderSummary = {
  id: string;
  buyerId: string;
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  deliveryFullName: string | null;
  deliveryPhone: string | null;
  deliveryAddress: string | null;
  deliveryReference: string | null;
  createdAt: string;
  updatedAt: string;
  buyerEmail?: string;
  sellerOrders?: SellerOrderSummary[];
};

export type OrderDetail = Omit<OrderSummary, "sellerOrders"> & {
  sellerOrders: Array<SellerOrderSummary & { items: OrderItem[] }>;
};

export type SellerOrderDetail = SellerOrderSummary & {
  buyerId: string;
  buyerEmail: string;
  deliveryFullName: string | null;
  deliveryPhone: string | null;
  deliveryAddress: string | null;
  deliveryReference: string | null;
  items: OrderItem[];
};

export type TrackedOrderItem = {
  productName: string;
  quantity: number;
  subtotal: number;
};

export type TrackedSellerOrder = {
  sellerCommercialName: string;
  status: SellerOrderStatus;
  subtotalAmount: number;
  items: TrackedOrderItem[];
};

export type TrackedOrder = {
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  currency: string;
  sellerOrders: TrackedSellerOrder[];
};

export type AdminSeller = SellerProfile & {
  userEmail: string;
};

export type AdminProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: ProductStatus;
  sellerId: string;
  commercialName: string;
  sellerSlug: string;
  sellerValidationStatus: SellerValidationStatus;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  mainImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductDetail = AdminProduct & {
  images: AdminProductImage[];
};
