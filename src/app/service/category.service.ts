import { categoryRepository } from "@/app/repository/category.repository";
import type { InferInsertModel } from "drizzle-orm";
import { categories } from "@/db/schema/categories";

type CreateCategoryInput = InferInsertModel<typeof categories>;
type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryService {
  create(data: CreateCategoryInput) {
    return categoryRepository.create(data);
  }

  findAll() {
    return categoryRepository.findAll();
  }

  findById(id: number) {
    return categoryRepository.findById(id);
  }

  update(id: number, data: UpdateCategoryInput) {
    return categoryRepository.update(id, data);
  }

  delete(id: number) {
    return categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();