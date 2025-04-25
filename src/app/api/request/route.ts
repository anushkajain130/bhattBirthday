import { NextRequest } from 'next/server';
import Busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), '/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ This function returns a readable stream from the Web Request
async function getRawBody(req: Request): Promise<ReadableStream<Uint8Array>> {
  if (!req.body) throw new Error('Readable body stream not found on request.');
  return req.body;
}

async function parseFormData(req: Request): Promise<{ fields: Record<string, string>, filePath: string }> {
  const rawBody = await getRawBody(req);
  const headers = Object.fromEntries(req.headers.entries());

  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers });
    const fields: Record<string, string> = {};
    let filePath = '';

    busboy.on('file', (_, file, info) => {
      const { filename } = info;
      const saveTo = path.join(uploadDir, `${Date.now()}-${filename}`);
      filePath = saveTo;
      const writeStream = fs.createWriteStream(saveTo);
      file.pipe(writeStream);
    });

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('finish', () => {
      resolve({ fields, filePath });
    });

    busboy.on('error', reject);

    // Convert Web ReadableStream to Node.js stream
    const reader = rawBody.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    const nodeStream = require('stream').Readable.from(stream);
    nodeStream.pipe(busboy);
  });
}

// POST handler
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { fields, filePath } = await parseFormData(req);

    if (!fields.note || !filePath) {
      return new Response(JSON.stringify({ error: 'Note and picture are required' }), { status: 400 });
    }

    const newNote = new Note({
      note: fields.note,
      picturePath: filePath.replace(process.cwd(), ''),
    });

    await newNote.save();

    return new Response(JSON.stringify({
      message: 'Note and picture saved successfully',
      note: newNote,
    }), { status: 200 });

  } catch (err) {
    console.error('POST error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}

// GET handler
export async function GET() {
  await dbConnect();

  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET error:', err);
    return new Response(JSON.stringify({ error: 'Error fetching notes' }), { status: 500 });
  }
}
