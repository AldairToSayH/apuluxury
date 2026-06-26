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