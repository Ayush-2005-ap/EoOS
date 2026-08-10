import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

export const supabaseStorage = {
  upload: async (fileName: string, input: Buffer | string, mimeType: string) => {
    const url = `${supabaseUrl}/storage/v1/object/eoos-media/${fileName}`;
    
    // Read file if input is a string (path)
    const bodyData = typeof input === 'string' ? fs.readFileSync(input) : input;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': mimeType,
      },
      body: bodyData as any
    });

    if (typeof input === 'string') {
      try { fs.unlinkSync(input); } catch (e) {} // cleanup temp file
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Supabase upload failed: ${errorText}`);
    }
    return { publicUrl: `${supabaseUrl}/storage/v1/object/public/eoos-media/${fileName}` };
  },
  remove: async (fileName: string) => {
    const url = `${supabaseUrl}/storage/v1/object/eoos-media/${fileName}`;
    await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
  }
};

// Use diskStorage to prevent Node.js from running out of memory on large uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

export const upload = multer({ storage });
