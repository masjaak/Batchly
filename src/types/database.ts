export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ingredient_categories: {
        Row: {
          id: string
          organization_id: string
          name: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          organization_id: string
          category_id: string | null
          name: string
          unit: string
          current_stock: number
          latest_price: number
          min_stock_level: number
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          category_id?: string | null
          name: string
          unit: string
          current_stock?: number
          latest_price?: number
          min_stock_level?: number
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          category_id?: string | null
          name?: string
          unit?: string
          current_stock?: number
          latest_price?: number
          min_stock_level?: number
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          organization_id: string
          name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          organization_id: string
          ingredient_id: string
          supplier_id: string | null
          type: string
          quantity: number
          unit_price: number | null
          reason: string | null
          notes: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          ingredient_id: string
          supplier_id?: string | null
          type: string
          quantity: number
          unit_price?: number | null
          reason?: string | null
          notes?: string | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          ingredient_id?: string
          supplier_id?: string | null
          type?: string
          quantity?: number
          unit_price?: number | null
          reason?: string | null
          notes?: string | null
          transaction_date?: string
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          organization_id: string
          name: string
          yield_amount: number
          yield_unit: string
          overhead_pct: number
          packaging_cost: number
          selling_price: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          yield_amount?: number
          yield_unit?: string
          overhead_pct?: number
          packaging_cost?: number
          selling_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          yield_amount?: number
          yield_unit?: string
          overhead_pct?: number
          packaging_cost?: number
          selling_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipe_items: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
          cost_at_create: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
          cost_at_create: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string
          quantity?: number
          unit?: string
          cost_at_create?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          organization_id: string
          recipe_id: string
          name: string
          sku: string | null
          unit: string
          default_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          recipe_id: string
          name: string
          sku?: string | null
          unit: string
          default_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          recipe_id?: string
          name?: string
          sku?: string | null
          unit?: string
          default_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          organization_id: string
          product_id: string
          quantity: number
          unit_price: number
          sale_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          product_id: string
          quantity: number
          unit_price: number
          sale_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          sale_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          organization_id: string
          category: string
          description: string | null
          amount: number
          expense_date: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          category: string
          description?: string | null
          amount: number
          expense_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          category?: string
          description?: string | null
          amount?: number
          expense_date?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          table_name: string
          record_id: string
          action: string
          actor_id: string | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          table_name: string
          record_id: string
          action: string
          actor_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          table_name?: string
          record_id?: string
          action?: string
          actor_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
