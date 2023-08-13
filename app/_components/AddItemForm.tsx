"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
//@ts-ignore
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { addDays, format } from "date-fns";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import useSWR, { useSWRConfig } from "swr";
import { getPantryList } from "@/services/Pantry";

const formSchema = z.object({
  itemName: z.string().min(2).max(50),
  price: z.preprocess(
    (args) => (args === "" ? undefined : args),
    z.coerce.number().min(0).positive("Price must be positive").optional()
  ),
  quantity: z.preprocess(
    (args) => (args === "" ? undefined : args),
    z.coerce
      .number({ required_error: "Quantity is required" })
      .min(1)
      .positive("Quantity must be positive")
  ),
  unit: z.string().min(1),
  expiryDate: z.date({ invalid_type_error: "Invalid date" }).optional(),
});

const AddItemForm = ({ closeDrawer }: { closeDrawer: () => void }) => {
  const supabase = createClientComponentClient<Database>();
  const { mutate } = useSWRConfig();
  const kitchenId = useParams().slug;
  const path = useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      quantity: 1,
      unit: "num",
      price: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from("pantry")
        .insert([
          {
            item_name: values.itemName,
            quantity: values.quantity,
            belongs_to: path.slug,
            expiry_date: values.expiryDate,
            price: values.price,
            unit: values.unit,
          },
        ])
        .select();
      if (error) throw error;
      if (data) {
        mutate("/pantry/list", () => getPantryList("/pantry/list", kitchenId,0), {
          optimisticData: (pantry) => ({ ...pantry, data }),
          rollbackOnError: true,
        });
        closeDrawer();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 text-left"
      >
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="eg) Pepper" {...field} />
              </FormControl>
              <FormDescription>What should we call this item ?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input min={0} type="number" placeholder="" {...field} />
              </FormControl>
              <FormDescription>
                How much did this item cost you ?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-5">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    className=" w-full"
                    min={0}
                    type="number"
                    placeholder="eg) 50"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Amount of the ingridient you have
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl defaultValue={"num"}>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="num">Number/s</SelectItem>
                      <SelectItem value="g">Grams</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="l">Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Unit of the amount you have</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiries on</FormLabel>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                  <Select
                    onValueChange={(value) =>
                      field.onChange(addDays(new Date(), parseInt(value)))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="0">Today</SelectItem>
                      <SelectItem value="1">Tomorrow</SelectItem>
                      <SelectItem value="3">In 3 days</SelectItem>
                      <SelectItem value="7">In a week</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      //@ts-ignore
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <FormDescription>
                Whats the expiry date on your item?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default AddItemForm;
