export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          name: string
          email: string
          password: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          password: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          password?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          id: number
          name: string
          specialty: string | null
          user_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          specialty?: string | null
          user_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          specialty?: string | null
          user_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: number
          name: string
          phone: string | null
          user_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          phone?: string | null
          user_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          phone?: string | null
          user_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: number
          name: string
          price: number
          duration_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          duration_minutes: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: number
          date_time: string
          client_id: number | null
          professional_id: number | null
          service_id: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date_time: string
          client_id?: number | null
          professional_id?: number | null
          service_id?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date_time?: string
          client_id?: number | null
          professional_id?: number | null
          service_id?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
