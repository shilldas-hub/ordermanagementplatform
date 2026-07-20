import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.user.updateMany({
      data: { role: 'SUPER_ADMIN' }
    });

    return NextResponse.json({ success: true, message: 'Upgraded all users to SUPER_ADMIN' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
