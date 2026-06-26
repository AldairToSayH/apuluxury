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