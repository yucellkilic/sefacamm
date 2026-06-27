export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          email: string;
          social_links: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          email: string;
          social_links?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          email?: string;
          social_links?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image_url: string | null;
          author_id: string | null;
          category_id: string | null;
          is_published: boolean;
          view_count: number;
          seo_title: string | null;
          seo_description: string | null;
          faq_schema: Json | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          featured_image_url?: string | null;
          author_id?: string | null;
          category_id?: string | null;
          is_published?: boolean;
          view_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          faq_schema?: Json | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          featured_image_url?: string | null;
          author_id?: string | null;
          category_id?: string | null;
          is_published?: boolean;
          view_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          faq_schema?: Json | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_name?: string;
          author_email?: string;
          content?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          is_active: boolean;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_active?: boolean;
          subscribed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_active?: boolean;
          subscribed_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
