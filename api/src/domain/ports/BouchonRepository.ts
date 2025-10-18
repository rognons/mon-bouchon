import type { Bouchon } from "../entities/Bouchon.ts";

// Port primaire - Interface du repository
export interface BouchonRepository {
  findAll(): Promise<Bouchon[]>;
}
