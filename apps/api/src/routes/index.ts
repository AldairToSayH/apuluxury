import { Router } from "express";

import { adminRouter } from "../modules/admin/admin.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { buyersRouter } from "../modules/buyers/buyers.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { catalogRouter } from "../modules/catalog/catalog.routes";
import { categoriesRouter } from "../modules/categories/categories.routes";
import { healthRouter } from "../modules/health/health.routes";
import { ordersRouter } from "../modules/orders/orders.routes";
import { productsRouter } from "../modules/products/products.routes";
import { sellersRouter } from "../modules/sellers/sellers.routes";
import { storesRouter } from "../modules/stores/stores.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/buyers", buyersRouter);
apiRouter.use("/sellers", sellersRouter);
apiRouter.use("/stores", storesRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", ordersRouter);
