import { NextRequest, NextResponse } from 'next/server';
import { rescheduleAppointment } from '@/app/actions/appointment';

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
    
    const formData = await request.formData();
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    // Validate required fields
    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }
    
    // Combine date and time into a proper datetime string
    const dateTime = new Date(`${date}T${time}`);
    
    // Create new FormData with the combined dateTime
    const newFormData = new FormData();
    newFormData.append('dateTime', dateTime.toISOString());
    
    // Pass shouldRedirect=false to prevent redirect in API route
    const result = await rescheduleAppointment(id, newFormData, false);
    
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
