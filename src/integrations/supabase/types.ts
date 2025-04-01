export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      builders: {
        Row: {
          adaptability: number | null
          communication: number | null
          consistency: number | null
          contribution: number | null
          cooperativeness: number | null
          created_at: string | null
          creativity: number | null
          decoration: number | null
          effort: number | null
          exterior: number | null
          id: string
          interior: number | null
          name: string
          overall_grade: string
          profile_image_url: string | null
          rank: string
          staff_id: string
        }
        Insert: {
          adaptability?: number | null
          communication?: number | null
          consistency?: number | null
          contribution?: number | null
          cooperativeness?: number | null
          created_at?: string | null
          creativity?: number | null
          decoration?: number | null
          effort?: number | null
          exterior?: number | null
          id?: string
          interior?: number | null
          name: string
          overall_grade: string
          profile_image_url?: string | null
          rank: string
          staff_id: string
        }
        Update: {
          adaptability?: number | null
          communication?: number | null
          consistency?: number | null
          contribution?: number | null
          cooperativeness?: number | null
          created_at?: string | null
          creativity?: number | null
          decoration?: number | null
          effort?: number | null
          exterior?: number | null
          id?: string
          interior?: number | null
          name?: string
          overall_grade?: string
          profile_image_url?: string | null
          rank?: string
          staff_id?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          adaptability: number | null
          communication: number | null
          conflict_resolution: number | null
          consistency: number | null
          contribution: number | null
          cooperativeness: number | null
          created_at: string | null
          creativity: number | null
          decoration: number | null
          effort: number | null
          engagement: number | null
          exterior: number | null
          fairness: number | null
          id: string
          initiative: number | null
          interior: number | null
          name: string
          objectivity: number | null
          overall_grade: string
          profile_image_url: string | null
          rank: string
          responsiveness: number | null
          rule_enforcement: number | null
          staff_id: string
          supportiveness: number | null
        }
        Insert: {
          adaptability?: number | null
          communication?: number | null
          conflict_resolution?: number | null
          consistency?: number | null
          contribution?: number | null
          cooperativeness?: number | null
          created_at?: string | null
          creativity?: number | null
          decoration?: number | null
          effort?: number | null
          engagement?: number | null
          exterior?: number | null
          fairness?: number | null
          id?: string
          initiative?: number | null
          interior?: number | null
          name: string
          objectivity?: number | null
          overall_grade: string
          profile_image_url?: string | null
          rank: string
          responsiveness?: number | null
          rule_enforcement?: number | null
          staff_id: string
          supportiveness?: number | null
        }
        Update: {
          adaptability?: number | null
          communication?: number | null
          conflict_resolution?: number | null
          consistency?: number | null
          contribution?: number | null
          cooperativeness?: number | null
          created_at?: string | null
          creativity?: number | null
          decoration?: number | null
          effort?: number | null
          engagement?: number | null
          exterior?: number | null
          fairness?: number | null
          id?: string
          initiative?: number | null
          interior?: number | null
          name?: string
          objectivity?: number | null
          overall_grade?: string
          profile_image_url?: string | null
          rank?: string
          responsiveness?: number | null
          rule_enforcement?: number | null
          staff_id?: string
          supportiveness?: number | null
        }
        Relationships: []
      }
      moderators: {
        Row: {
          adaptability: number | null
          communication: number | null
          conflict_resolution: number | null
          created_at: string | null
          engagement: number | null
          fairness: number | null
          id: string
          initiative: number | null
          name: string
          objectivity: number | null
          overall_grade: string
          profile_image_url: string | null
          rank: string
          responsiveness: number | null
          rule_enforcement: number | null
          staff_id: string
          supportiveness: number | null
        }
        Insert: {
          adaptability?: number | null
          communication?: number | null
          conflict_resolution?: number | null
          created_at?: string | null
          engagement?: number | null
          fairness?: number | null
          id?: string
          initiative?: number | null
          name: string
          objectivity?: number | null
          overall_grade: string
          profile_image_url?: string | null
          rank: string
          responsiveness?: number | null
          rule_enforcement?: number | null
          staff_id: string
          supportiveness?: number | null
        }
        Update: {
          adaptability?: number | null
          communication?: number | null
          conflict_resolution?: number | null
          created_at?: string | null
          engagement?: number | null
          fairness?: number | null
          id?: string
          initiative?: number | null
          name?: string
          objectivity?: number | null
          overall_grade?: string
          profile_image_url?: string | null
          rank?: string
          responsiveness?: number | null
          rule_enforcement?: number | null
          staff_id?: string
          supportiveness?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
