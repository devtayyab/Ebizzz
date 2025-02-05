"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  supplier_name: string;
  manager_name: string;
  type: string;
  created_at: string;
};

export default function ProductDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"price" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [priceRange, _setPriceRange] = useState<"all" | "low" | "medium" | "high">("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [seletedType , setSeletedType] = useState<string>("all");
  const [selectedManager, setSelectedManager] = useState<string>("all");
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [managers, setManagers] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [search, sortField, sortOrder, priceRange, selectedSupplier, selectedManager , seletedType]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order(sortField, { ascending: sortOrder === "asc" });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (selectedSupplier !== "all") {
        query = query.eq("supplier_name", selectedSupplier);
      }

      if(selectedManager !== "all") {
        query = query.eq("manager_name", selectedManager);
      }

      if (seletedType !== "all") {
        query = query.eq("type", seletedType);
      }



      if (priceRange !== "all") {
        switch (priceRange) {
          case "low":
            query = query.lt("price", 100);
            break;
          case "medium":
            query = query.gte("price", 100).lt("price", 500);
            break;
          case "high":
            query = query.gte("price", 500);
            break;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);

      // Get unique suppliers
      const uniqueSuppliers = Array.from(new Set([(data?.map(p => p.supplier_name) || [])].flat()))
      const uniqueManagers = Array.from(new Set([(data?.map(p => p.manager_name) || [])].flat()))
      const uniqueTypes = Array.from(new Set([(data?.map(p => p.type) || [])].flat()))
      setManagers(uniqueManagers);
      setTypes(uniqueTypes);
      setSuppliers(uniqueSuppliers);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field: "price" | "created_at") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Dashboard</h1>
        <Link href="/products/add">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* <Select
            value={priceRange}
            onValueChange={(value: "all" | "low" | "medium" | "high") => setPriceRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Low (&lt; $100)</SelectItem>
              <SelectItem value="medium">Medium ($100 - $500)</SelectItem>
              <SelectItem value="high">High (&gt; $500)</SelectItem>
            </SelectContent>
          </Select> */}

          <Select
            value={selectedSupplier}
            onValueChange={(value) => setSelectedSupplier(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={seletedType}
            onValueChange={(value) => setSeletedType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedManager}
            onValueChange={(value) => setSelectedManager(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manager</SelectItem>
              {managers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("price")}
                    className="flex items-center gap-1"
                  >
                    Price
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Supplier/Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1"
                  >
                    Date Added
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.supplier_name}</TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>{product.manager_name}</TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}