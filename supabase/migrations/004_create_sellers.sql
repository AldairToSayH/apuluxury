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