import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';

  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('posts')
      .select('*, author:authors(*), category:categories(*)', { count: 'exact' })
      .eq('is_published', true);

    // Filtering
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    if (tag) {
      const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tag)
        .single();
      if (tagData) {
        const { data: postIds } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', tagData.id);
        if (postIds) {
          query = query.in('id', postIds.map((pt) => pt.post_id));
        }
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'oldest':
        query = query.order('published_at', { ascending: true });
        break;
      default: // newest
        query = query.order('published_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: post, error } = await supabase
      .from('posts')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
