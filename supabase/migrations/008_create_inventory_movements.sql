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