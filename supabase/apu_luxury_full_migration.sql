-- APU LUXURY full database migration for Supabase SQL Editor
-- Generated from database/migrations and database/seeds.
-- Run once on an empty Supabase project public schema.


-- === migration 001_init_extensions.sql ===

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- === migration 002_create_users.sql ===

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    auth_provider_id VARCHAR(255),

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('buyer', 'seller', 'admin')),

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 003_create_buyers.sql ===

CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dni VARCHAR(20),
    phone VARCHAR(30),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_buyers_updated_at
BEFORE UPDATE ON buyers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 004_create_sellers.sql ===

CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    tenant_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    commercial_name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,

    ruc VARCHAR(20),
    phone VARCHAR(30),
    address TEXT,
    business_description TEXT,

    validation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (validation_status IN ('pending', 'approved', 'rejected', 'suspended')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_seller_tenant UNIQUE (id, tenant_id)
);

CREATE UNIQUE INDEX idx_sellers_ruc_unique
ON sellers(ruc)
WHERE ruc IS NOT NULL;

CREATE TRIGGER trg_sellers_updated_at
BEFORE UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 005_create_categories.sql ===

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 006_create_products.sql ===

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id),

    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT,

    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),

    material VARCHAR(100),
    color VARCHAR(80),
    size VARCHAR(80),

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'inactive', 'rejected')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_products_seller_tenant
        FOREIGN KEY (seller_id, tenant_id)
        REFERENCES sellers(id, tenant_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_product_tenant_seller UNIQUE (id, tenant_id, seller_id)
);

CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 007_create_product_images.sql ===

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    seller_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    storage_path TEXT,
    alt_text VARCHAR(255),

    position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
    is_main BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id, tenant_id, seller_id)
        REFERENCES products(id, tenant_id, seller_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_tenant_id ON product_images(tenant_id);
CREATE INDEX idx_product_images_seller_id ON product_images(seller_id);

-- === migration 008_create_inventory_movements.sql ===

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    seller_id UUID NOT NULL,

    movement_type VARCHAR(30) NOT NULL
        CHECK (movement_type IN ('in', 'out', 'adjustment', 'sale', 'return')),

    quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),

    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),

    reason TEXT,

    reference_type VARCHAR(50),
    reference_id UUID,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id, tenant_id, seller_id)
        REFERENCES products(id, tenant_id, seller_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_inventory_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_tenant_id ON inventory_movements(tenant_id);
CREATE INDEX idx_inventory_seller_id ON inventory_movements(seller_id);
CREATE INDEX idx_inventory_created_at ON inventory_movements(created_at);

-- === migration 009_create_carts.sql ===

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'converted', 'abandoned')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_active_cart_per_buyer
ON carts(buyer_id)
WHERE status = 'active';

CREATE INDEX idx_carts_buyer_id ON carts(buyer_id);

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 010_create_cart_items.sql ===

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,

    product_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    seller_id UUID NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),

    unit_price_at_added NUMERIC(10,2) NOT NULL CHECK (unit_price_at_added >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id, tenant_id, seller_id)
        REFERENCES products(id, tenant_id, seller_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_product_per_cart UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_tenant_id ON cart_items(tenant_id);

CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 011_create_orders.sql ===

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE RESTRICT,

    order_code VARCHAR(50) NOT NULL UNIQUE,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),

    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),

    currency VARCHAR(10) NOT NULL DEFAULT 'PEN',

    delivery_full_name VARCHAR(200),
    delivery_phone VARCHAR(30),
    delivery_address TEXT,
    delivery_reference TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 012_create_seller_orders.sql ===

CREATE TABLE seller_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    tenant_id UUID NOT NULL,
    seller_id UUID NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_preparation', 'shipped', 'delivered', 'cancelled')),

    subtotal_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_seller_orders_seller_tenant
        FOREIGN KEY (seller_id, tenant_id)
        REFERENCES sellers(id, tenant_id)
        ON DELETE RESTRICT,

    CONSTRAINT unique_seller_per_order UNIQUE (order_id, seller_id)
);

CREATE INDEX idx_seller_orders_order_id ON seller_orders(order_id);
CREATE INDEX idx_seller_orders_tenant_id ON seller_orders(tenant_id);
CREATE INDEX idx_seller_orders_seller_id ON seller_orders(seller_id);
CREATE INDEX idx_seller_orders_status ON seller_orders(status);

CREATE TRIGGER trg_seller_orders_updated_at
BEFORE UPDATE ON seller_orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === migration 013_create_order_items.sql ===

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_order_id UUID NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,

    product_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    seller_id UUID NOT NULL,

    product_name VARCHAR(200) NOT NULL,
    product_slug VARCHAR(220),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id, tenant_id, seller_id)
        REFERENCES products(id, tenant_id, seller_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_seller_order_id ON order_items(seller_order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_tenant_id ON order_items(tenant_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);

-- === migration 014_create_order_status_history.sql ===

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    seller_order_id UUID REFERENCES seller_orders(id) ON DELETE CASCADE,

    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,

    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    note TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_order_or_seller_order
        CHECK (
            order_id IS NOT NULL
            OR seller_order_id IS NOT NULL
        )
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_seller_order_id ON order_status_history(seller_order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);

-- === migration 015_create_stores_and_auth_profile_fields.sql ===

ALTER TABLE users
ADD COLUMN google_id VARCHAR(255),
ADD COLUMN avatar_url TEXT,
ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local'
    CHECK (auth_provider IN ('local', 'google'));

CREATE UNIQUE INDEX idx_users_google_id_unique
ON users(google_id)
WHERE google_id IS NOT NULL;

ALTER TABLE buyers
ADD COLUMN address TEXT;

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    seller_id UUID UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    subdomain VARCHAR(150) NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_stores_slug_unique ON stores(slug);
CREATE UNIQUE INDEX idx_stores_subdomain_unique ON stores(subdomain);
CREATE INDEX idx_stores_seller_id ON stores(seller_id);
CREATE INDEX idx_stores_status ON stores(status);

CREATE TRIGGER trg_stores_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- === seed 001_seed_initial_data.sql ===

--

-- === seed 002_seed_product_images.sql ===

INSERT INTO product_images (
    product_id,
    tenant_id,
    seller_id,
    image_url,
    storage_path,
    alt_text,
    position,
    is_main
)
SELECT
    products.id,
    products.tenant_id,
    products.seller_id,
    'https://picsum.photos/600/800',
    NULL,
    'Imagen de prueba del producto',
    0,
    TRUE
FROM products
WHERE NOT EXISTS (
    SELECT 1
    FROM product_images
    WHERE product_images.product_id = products.id
)
ORDER BY products.created_at
LIMIT 1;
