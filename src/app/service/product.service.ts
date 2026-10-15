import { productRepository } from "@/app/repository/product.repository";
import type { InferInsertModel } from "drizzle-orm";
import { products } from "@/db/schema/products";

type CreateProductInput = InferInsertModel<typeof products>;
type UpdateProductInput = Partial<CreateProductInput>;

export class ProductService {
  create(data: CreateProductInput) {
    return productRepository.create(data);
  }

  findAll() {
    return productRepository.findAll();
  }

  findById(id: number) {
    return productRepository.findById(id);
  }

  update(id: number, data: UpdateProductInput) {
    return productRepository.update(id, data);
  }

  delete(id: number) {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();