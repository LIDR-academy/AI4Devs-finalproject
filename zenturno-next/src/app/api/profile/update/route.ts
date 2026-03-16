import { NextRequest, NextResponse } from 'next/server';
import { updateProfile } from '@/app/actions/profile';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await updateProfile(formData);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.redirect(new URL('/dashboard/profile', request.url));
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
