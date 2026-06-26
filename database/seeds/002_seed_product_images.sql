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
