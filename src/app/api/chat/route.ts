import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { requestedUserId, message } = await req.json();

    // 1. Secure Server-Side Authorization Check
    // We fetch the user from the Supabase session, never trusting the client-provided ID.
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== requestedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Logic for Chat (Placeholder)
    // Here you would process the chat message...

    return NextResponse.json({ success: true, message: 'Message received and authorized.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
