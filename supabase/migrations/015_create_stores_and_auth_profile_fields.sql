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
