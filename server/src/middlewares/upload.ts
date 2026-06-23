import multer from 'multer';

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

export const supabaseStorage = {
  upload: async (fileName: string, buffer: Buffer, mimeType: string) => {
    const url = `${supabaseUrl}/storage/v1/object/eoos-media/${fileName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': mimeType,
      },
      body: buffer as any
    });
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

// We use memoryStorage so the file is kept in memory and passed directly to Supabase via buffer.
const storage = multer.memoryStorage();

export const upload = multer({ storage });
