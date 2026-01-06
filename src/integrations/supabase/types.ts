export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cameras: {
        Row: {
          brand: string
          created_at: string
          enabled: boolean
          frame_rate: number
          id: string
          image_url: string | null
          interface: string
          model: string
          resolution: string
          sensor_size: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          enabled?: boolean
          frame_rate: number
          id?: string
          image_url?: string | null
          interface: string
          model: string
          resolution: string
          sensor_size: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          enabled?: boolean
          frame_rate?: number
          id?: string
          image_url?: string | null
          interface?: string
          model?: string
          resolution?: string
          sensor_size?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      controllers: {
        Row: {
          brand: string
          cpu: string
          created_at: string
          enabled: boolean
          gpu: string | null
          id: string
          image_url: string | null
          memory: string
          model: string
          performance: string
          storage: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          brand: string
          cpu: string
          created_at?: string
          enabled?: boolean
          gpu?: string | null
          id?: string
          image_url?: string | null
          memory: string
          model: string
          performance: string
          storage: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          brand?: string
          cpu?: string
          created_at?: string
          enabled?: boolean
          gpu?: string | null
          id?: string
          image_url?: string | null
          memory?: string
          model?: string
          performance?: string
          storage?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      function_modules: {
        Row: {
          camera_id: string | null
          created_at: string
          deep_learning_config: Json | null
          defect_config: Json | null
          description: string | null
          flowchart_saved: boolean | null
          id: string
          measurement_config: Json | null
          misjudgment_strategy:
            | Database["public"]["Enums"]["quality_strategy"]
            | null
          name: string
          ocr_config: Json | null
          output_types: string[] | null
          positioning_config: Json | null
          processing_time_limit: number | null
          roi_rect: Json | null
          roi_strategy: string | null
          schematic_image_url: string | null
          selected_camera: string | null
          selected_controller: string | null
          selected_lens: string | null
          selected_light: string | null
          status: Database["public"]["Enums"]["entity_status"]
          trigger_type: Database["public"]["Enums"]["trigger_type"] | null
          type: Database["public"]["Enums"]["module_type"]
          updated_at: string
          workstation_id: string
        }
        Insert: {
          camera_id?: string | null
          created_at?: string
          deep_learning_config?: Json | null
          defect_config?: Json | null
          description?: string | null
          flowchart_saved?: boolean | null
          id?: string
          measurement_config?: Json | null
          misjudgment_strategy?:
            | Database["public"]["Enums"]["quality_strategy"]
            | null
          name: string
          ocr_config?: Json | null
          output_types?: string[] | null
          positioning_config?: Json | null
          processing_time_limit?: number | null
          roi_rect?: Json | null
          roi_strategy?: string | null
          schematic_image_url?: string | null
          selected_camera?: string | null
          selected_controller?: string | null
          selected_lens?: string | null
          selected_light?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          trigger_type?: Database["public"]["Enums"]["trigger_type"] | null
          type: Database["public"]["Enums"]["module_type"]
          updated_at?: string
          workstation_id: string
        }
        Update: {
          camera_id?: string | null
          created_at?: string
          deep_learning_config?: Json | null
          defect_config?: Json | null
          description?: string | null
          flowchart_saved?: boolean | null
          id?: string
          measurement_config?: Json | null
          misjudgment_strategy?:
            | Database["public"]["Enums"]["quality_strategy"]
            | null
          name?: string
          ocr_config?: Json | null
          output_types?: string[] | null
          positioning_config?: Json | null
          processing_time_limit?: number | null
          roi_rect?: Json | null
          roi_strategy?: string | null
          schematic_image_url?: string | null
          selected_camera?: string | null
          selected_controller?: string | null
          selected_lens?: string | null
          selected_light?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          trigger_type?: Database["public"]["Enums"]["trigger_type"] | null
          type?: Database["public"]["Enums"]["module_type"]
          updated_at?: string
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "function_modules_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      lenses: {
        Row: {
          aperture: string
          brand: string
          compatible_cameras: string[] | null
          created_at: string
          enabled: boolean
          focal_length: string
          id: string
          image_url: string | null
          model: string
          mount: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          aperture: string
          brand: string
          compatible_cameras?: string[] | null
          created_at?: string
          enabled?: boolean
          focal_length: string
          id?: string
          image_url?: string | null
          model: string
          mount: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          aperture?: string
          brand?: string
          compatible_cameras?: string[] | null
          created_at?: string
          enabled?: boolean
          focal_length?: string
          id?: string
          image_url?: string | null
          model?: string
          mount?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      lights: {
        Row: {
          brand: string
          color: string
          created_at: string
          enabled: boolean
          id: string
          image_url: string | null
          model: string
          power: string
          recommended_cameras: string[] | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          brand: string
          color: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          model: string
          power: string
          recommended_cameras?: string[] | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          brand?: string
          color?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string | null
          model?: string
          power?: string
          recommended_cameras?: string[] | null
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      mechanical_layouts: {
        Row: {
          camera_count: number | null
          camera_mounts: string[] | null
          conveyor_type: string | null
          created_at: string
          front_view_saved: boolean | null
          front_view_url: string | null
          id: string
          lens_count: number | null
          light_count: number | null
          machine_outline: Json | null
          mechanisms: string[] | null
          motion_range: Json | null
          selected_cameras: Json | null
          selected_controller: Json | null
          selected_lenses: Json | null
          selected_lights: Json | null
          side_view_saved: boolean | null
          side_view_url: string | null
          status: Database["public"]["Enums"]["entity_status"]
          top_view_saved: boolean | null
          top_view_url: string | null
          updated_at: string
          workstation_id: string
        }
        Insert: {
          camera_count?: number | null
          camera_mounts?: string[] | null
          conveyor_type?: string | null
          created_at?: string
          front_view_saved?: boolean | null
          front_view_url?: string | null
          id?: string
          lens_count?: number | null
          light_count?: number | null
          machine_outline?: Json | null
          mechanisms?: string[] | null
          motion_range?: Json | null
          selected_cameras?: Json | null
          selected_controller?: Json | null
          selected_lenses?: Json | null
          selected_lights?: Json | null
          side_view_saved?: boolean | null
          side_view_url?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          top_view_saved?: boolean | null
          top_view_url?: string | null
          updated_at?: string
          workstation_id: string
        }
        Update: {
          camera_count?: number | null
          camera_mounts?: string[] | null
          conveyor_type?: string | null
          created_at?: string
          front_view_saved?: boolean | null
          front_view_url?: string | null
          id?: string
          lens_count?: number | null
          light_count?: number | null
          machine_outline?: Json | null
          mechanisms?: string[] | null
          motion_range?: Json | null
          selected_cameras?: Json | null
          selected_controller?: Json | null
          selected_lenses?: Json | null
          selected_lights?: Json | null
          side_view_saved?: boolean | null
          side_view_url?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          top_view_saved?: boolean | null
          top_view_url?: string | null
          updated_at?: string
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mechanical_layouts_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: true
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          code: string
          created_at: string
          customer: string
          cycle_time_target: number | null
          date: string | null
          environment: string[] | null
          id: string
          main_camera_brand: string | null
          name: string
          notes: string | null
          product_process: string | null
          production_line: string | null
          quality_strategy:
            | Database["public"]["Enums"]["quality_strategy"]
            | null
          responsible: string | null
          sales_responsible: string | null
          spec_version: string | null
          status: Database["public"]["Enums"]["entity_status"]
          template_id: string | null
          updated_at: string
          use_3d: boolean | null
          use_ai: boolean | null
          user_id: string | null
          vision_responsible: string | null
        }
        Insert: {
          code: string
          created_at?: string
          customer: string
          cycle_time_target?: number | null
          date?: string | null
          environment?: string[] | null
          id?: string
          main_camera_brand?: string | null
          name: string
          notes?: string | null
          product_process?: string | null
          production_line?: string | null
          quality_strategy?:
            | Database["public"]["Enums"]["quality_strategy"]
            | null
          responsible?: string | null
          sales_responsible?: string | null
          spec_version?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          template_id?: string | null
          updated_at?: string
          use_3d?: boolean | null
          use_ai?: boolean | null
          user_id?: string | null
          vision_responsible?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          customer?: string
          cycle_time_target?: number | null
          date?: string | null
          environment?: string[] | null
          id?: string
          main_camera_brand?: string | null
          name?: string
          notes?: string | null
          product_process?: string | null
          production_line?: string | null
          quality_strategy?:
            | Database["public"]["Enums"]["quality_strategy"]
            | null
          responsible?: string | null
          sales_responsible?: string | null
          spec_version?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          template_id?: string | null
          updated_at?: string
          use_3d?: boolean | null
          use_ai?: boolean | null
          user_id?: string | null
          vision_responsible?: string | null
        }
        Relationships: []
      }
      workstations: {
        Row: {
          code: string
          created_at: string
          cycle_time: number | null
          enclosed: boolean | null
          environment_description: string | null
          id: string
          in_out_direction: string | null
          install_space: Json | null
          name: string
          notes: string | null
          observation_target: string | null
          process_stage: string | null
          product_dimensions: Json | null
          project_id: string
          status: Database["public"]["Enums"]["entity_status"]
          type: Database["public"]["Enums"]["workstation_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          cycle_time?: number | null
          enclosed?: boolean | null
          environment_description?: string | null
          id?: string
          in_out_direction?: string | null
          install_space?: Json | null
          name: string
          notes?: string | null
          observation_target?: string | null
          process_stage?: string | null
          product_dimensions?: Json | null
          project_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          type?: Database["public"]["Enums"]["workstation_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          cycle_time?: number | null
          enclosed?: boolean | null
          environment_description?: string | null
          id?: string
          in_out_direction?: string | null
          install_space?: Json | null
          name?: string
          notes?: string | null
          observation_target?: string | null
          process_stage?: string | null
          product_dimensions?: Json | null
          project_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          type?: Database["public"]["Enums"]["workstation_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workstations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      entity_status: "draft" | "incomplete" | "complete"
      module_type:
        | "positioning"
        | "defect"
        | "ocr"
        | "deeplearning"
        | "measurement"
      quality_strategy: "no_miss" | "balanced" | "allow_pass"
      trigger_type: "io" | "encoder" | "software" | "continuous"
      workstation_type: "line" | "turntable" | "robot" | "platform"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entity_status: ["draft", "incomplete", "complete"],
      module_type: [
        "positioning",
        "defect",
        "ocr",
        "deeplearning",
        "measurement",
      ],
      quality_strategy: ["no_miss", "balanced", "allow_pass"],
      trigger_type: ["io", "encoder", "software", "continuous"],
      workstation_type: ["line", "turntable", "robot", "platform"],
    },
  },
} as const
