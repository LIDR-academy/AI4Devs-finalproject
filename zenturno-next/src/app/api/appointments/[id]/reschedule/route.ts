import { NextRequest, NextResponse } from 'next/server';
import { rescheduleAppointment } from '@/app/actions/appointment';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointmentId = parseInt(id, 10);
    
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { newDate, newTime } = body;
    
    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: 'New date and time are required' },
        { status: 400 }
      );
    }

    // Create FormData to match the function signature
    const formData = new FormData();
    const dateTime = new Date(`${newDate}T${newTime}`);
    formData.append('dateTime', dateTime.toISOString());
    
    const result = await rescheduleAppointment(appointmentId, formData);
    
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
