import { inventoryRepository } from "@/app/repository/inventory.repository";
import type { InferInsertModel } from "drizzle-orm";
import { inventory } from "@/db/schema/inventory";

type CreateInventoryInput = InferInsertModel<typeof inventory>;
type UpdateInventoryInput = Partial<CreateInventoryInput>;

export class InventoryService {
  create(data: CreateInventoryInput) {
    return inventoryRepository.create(data);
  }

  findAll() {
    return inventoryRepository.findAll();
  }

  findById(id: number) {
    return inventoryRepository.findById(id);
  }

  update(id: number, data: UpdateInventoryInput) {
    return inventoryRepository.update(id, data);
  }

  delete(id: number) {
    return inventoryRepository.delete(id);
  }
}

export const inventoryService = new InventoryService();