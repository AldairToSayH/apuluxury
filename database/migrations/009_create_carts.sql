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