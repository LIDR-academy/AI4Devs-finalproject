import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brlitcctouvjgdbmozsc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybGl0Y2N0b3V2amdkYm1venNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTUzNDEsImV4cCI6MjA3OTY3MTM0MX0.6PYv8TbQNeGa1l7pJpfavIcAzd7753NTKoh_n0N_7HA';

export const supabase = createClient(supabaseUrl, supabaseKey);
