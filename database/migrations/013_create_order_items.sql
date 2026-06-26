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