import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { secret, path } = await request.json();

    // Verify secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Revalidate the specified path
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      message: `Path ${path} revalidated successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate', revalidated: false },
      { status: 500 }
    );
  }
}
