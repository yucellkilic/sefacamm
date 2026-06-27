import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

// GET hero settings
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: settings, error } = await supabase
      .from('site_settings' as any)
      .select('key, value')
      .in('key', ['hero_title', 'hero_subtitle', 'hero_button_text']);

    if (error) throw error;

    // Transform array to object
    const settingsObject = (settings as any[] || []).reduce(
      (acc: Record<string, string>, { key, value }: any) => {
        acc[key] = value;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      hero_title: settingsObject.hero_title || '',
      hero_subtitle: settingsObject.hero_subtitle || '',
      hero_button_text: settingsObject.hero_button_text || '',
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 });
  }
}

// PUT update hero settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hero_title, hero_subtitle, hero_button_text } = body;

    // Upsert settings
    const updates = [];
    if (hero_title !== undefined) {
      updates.push({ key: 'hero_title', value: hero_title, updated_at: new Date().toISOString() });
    }
    if (hero_subtitle !== undefined) {
      updates.push({ key: 'hero_subtitle', value: hero_subtitle, updated_at: new Date().toISOString() });
    }
    if (hero_button_text !== undefined) {
      updates.push({ key: 'hero_button_text', value: hero_button_text, updated_at: new Date().toISOString() });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Güncellenecek ayar bulunamadı' }, { status: 400 });
    }

    const { error } = await supabase.from('site_settings' as any).upsert(updates, {
      onConflict: 'key',
    });

    if (error) throw error;

    // Revalidate home page
    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Ayarlar güncellendi' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}
