"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { format } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  status: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1")
  })).min(1, "At least one product must be added")
});

export function OrderForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  clients,
  products = [],
  error
}: { 
  initialData?: any; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
  clients: any[];
  products?: any[];
  error?: string | null;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      clientId: initialData?.clientId || "",
      status: initialData?.status || "PENDING",
      items: initialData?.items?.length > 0 ? initialData.items.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity
      })) : [{ productId: "", quantity: 1 }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchItems = useWatch({
    control: form.control,
    name: "items"
  });

  // Calculate total amount dynamically
  const totalAmount = watchItems.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    const price = product?.price || 0;
    return total + (price * (item.quantity || 0));
  }, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client">
                      {field.value ? clients.find(c => c.id === field.value)?.companyName : "Select client"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base font-semibold">Order Items</FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => append({ productId: "", quantity: 1 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product">
                                {field.value ? products.find(p => p.id === field.value)?.name : "Select product"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} (₹{p.price?.toLocaleString('en-IN')})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 mb-[2px]"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {form.formState.errors.items?.root && (
              <p className="text-sm font-medium text-red-500 mt-2">
                {form.formState.errors.items.root.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg mt-4 border border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Calculated Total</span>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status">
                      {field.value ? field.value.replace(/_/g, ' ') : "Select status"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="PENDING_ACCOUNT_CREATION">PENDING ACCOUNT CREATION</SelectItem>
                  <SelectItem value="PENDING_DISPATCH_REVIEW">PENDING DISPATCH REVIEW</SelectItem>
                  <SelectItem value="READY_FOR_DISPATCH">READY FOR DISPATCH</SelectItem>
                  <SelectItem value="BACKORDERED">BACKORDERED</SelectItem>
                  <SelectItem value="DISPATCHED">DISPATCHED</SelectItem>
                  <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 w-full sm:w-auto text-left">
            {initialData?.createdAt && (
              <span>Created: {format(new Date(initialData.createdAt), "MMM d, yyyy h:mm a")}</span>
            )}
            {initialData?.updatedAt && (
              <span className="ml-3">Modified: {format(new Date(initialData.updatedAt), "MMM d, yyyy h:mm a")}</span>
            )}
          </div>
          <div className="flex justify-end w-full sm:w-auto">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
