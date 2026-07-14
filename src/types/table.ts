export type TableStatus = "FREE" | "OCCUPIED" | "RESERVED";

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
}
