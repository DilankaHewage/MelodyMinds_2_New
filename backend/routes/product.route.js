import express from "express";
// import Product from './models/product.model.js';

import { createProducts, deleteProduct, getProduct, updateProduct } from "./controllers/product.controller.js";


const router = express.Router();

router.post("/",createProducts);

router.delete("/:id",deleteProduct);

router.get("/", getProduct);

router.put("/:id", updateProduct);


export default router;