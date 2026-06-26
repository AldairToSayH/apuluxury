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