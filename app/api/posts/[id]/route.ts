import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, author:authors(*), category:categories(*)')
      .eq('id', params.id)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get tags
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tag:tags(*)')
      .eq('post_id', params.id);

    const tags = postTags?.map((pt: any) => pt.tag) || [];

    // Get related posts
    let relatedQuery = supabase
      .from('posts')
      .select('*, author:authors(*), category:categories(*)')
      .eq('is_published', true)
      .neq('id', params.id)
      .limit(3);

    if (post.category_id) {
      relatedQuery = relatedQuery.eq('category_id', post.category_id);
    }

    const { data: relatedPosts } = await relatedQuery;

    return NextResponse.json({
      post: { ...post, tags },
      relatedPosts: relatedPosts || [],
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { data: post, error } = await supabase
      .from('posts')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
