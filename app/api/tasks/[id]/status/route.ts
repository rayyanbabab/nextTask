import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { status, failureReason } = await req.json()

  if (!['PROCESS', 'SUCCESS', 'FAILED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const task = await prisma.task.update({
    where: { id: Number(params.id) },
    data: { 
      status, 
      failureReason: status === 'FAILED' ? failureReason : null,
    },
  })

  return NextResponse.json({ task })
}


