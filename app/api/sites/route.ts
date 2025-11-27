import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Site from '@/lib/models/siteModel';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const [sites, total] = await Promise.all([
      Site.find({ isApproved: true })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit),
      Site.countDocuments({ isApproved: true }),
    ]);
    
    return NextResponse.json({
      sites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}
