import { NextRequest, NextResponse } from 'next/server';
import { createService } from '@/app/actions/service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await createService(formData);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.redirect(new URL('/services', request.url));
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
