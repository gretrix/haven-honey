import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...params.path)

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase()
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }

    const contentType = contentTypeMap[ext] || 'application/octet-stream'

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving uploaded file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

