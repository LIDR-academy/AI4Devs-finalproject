import { NextRequest, NextResponse } from 'next/server';
import { confirmAppointment } from '@/app/actions/appointment';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // No need to parse as integer since ID could be UUID or integer
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }
    
    // Pass shouldRedirect=false to prevent redirect in API route
    const result = await confirmAppointment(id, false);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
