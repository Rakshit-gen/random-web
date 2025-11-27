import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Site from '@/lib/models/siteModel';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { url, title, category, genres, year, description } = body;
    
    // Validation
    if (!url || !title || !category || !year || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Parse genres if it's a string
    let genresArray = genres;
    if (typeof genres === 'string') {
      genresArray = genres.split(',').map((g: string) => g.trim()).filter(Boolean);
    }
    
    const newSite = await Site.create({
      url,
      title,
      category,
      genres: genresArray || [],
      year: parseInt(year),
      description,
      isApproved: false, // New submissions need approval
      addedAt: new Date(),
    });
    
    return NextResponse.json(
      { message: 'Site submitted successfully', site: newSite },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting site:', error);
    return NextResponse.json(
      { error: 'Failed to submit site' },
      { status: 500 }
    );
  }
}
