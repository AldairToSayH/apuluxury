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