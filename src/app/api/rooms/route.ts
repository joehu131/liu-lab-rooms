import { NextResponse } from 'next/server';
import { fetchTimeEditSchedule } from '@/lib/timeedit';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schedule = await fetchTimeEditSchedule(14);

    return NextResponse.json(schedule, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching TimeEdit schedule:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch schedule from TimeEdit',
      },
      { status: 500 }
    );
  }
}
