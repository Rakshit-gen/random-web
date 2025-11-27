import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Site from '@/lib/models/siteModel';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    
    // Build query filter
    const filter: any = { isApproved: true };
    if (category) {
      filter.category = category;
    }
    if (year) {
      filter.year = parseInt(year);
    }
    
    const count = await Site.countDocuments(filter);
    
    if (count === 0) {
      return NextResponse.json(
        { error: 'No approved sites available' },
        { status: 404 }
      );
    }
    
    const random = Math.floor(Math.random() * count);
    const site = await Site.findOne(filter).skip(random);
    
    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching random site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random site' },
      { status: 500 }
    );
  }
}
