import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Await the client creation since it's an async function
    const supabase = await createClient()
    
    // Fetch all specialties ordered by name
    const { data: specialties, error } = await supabase
      .from('specialties')
      .select('id, name, description')
      .order('name')
    
    if (error) {
      console.error('Error fetching specialties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch specialties' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(specialties)
  } catch (error) {
    console.error('Unexpected error fetching specialties:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
