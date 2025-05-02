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
      action_weights: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
          weight: number
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          weight?: number
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          source: string
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          source: string
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          source?: string
          token?: string
        }
        Relationships: []
      }
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
      score_events: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          points: number
          source: string
          staff_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          points: number
          source: string
          staff_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          points?: number
          source?: string
          staff_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_staff_score: {
        Args: { staff_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
