import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { CreateCustomerInput, Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { Paginated } from "@/types/pagination";

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ["customers", search ?? ""],
    queryFn: async () =>
      (await api.get<Paginated<Customer>>("/customers/", { params: search ? { search } : undefined })).data
        .results,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => (await api.post<Customer>("/customers/", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useCustomerOrders(customerId: number | null) {
  return useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: async () => (await api.get<Order[]>(`/customers/${customerId}/orders/`)).data,
    enabled: customerId !== null,
  });
}
