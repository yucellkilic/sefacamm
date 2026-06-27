import { Database } from './database';

export type Author = Database['public']['Tables']['authors']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Subscriber = Database['public']['Tables']['subscribers']['Row'];
export type Setting = Database['public']['Tables']['settings']['Row'];

export interface PostWithRelations extends Post {
  author: Author | null;
  category: Category | null;
  tags?: Tag[];
}

export interface SocialLinks {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

export interface FAQItem {
  question: string;
  answer: string;
}
