import { google } from 'googleapis';

async function test() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const day1Res = await drive.files.list({
      q: `'1OLt746jMzCRpxefOQijX84HTIg0uJKEY' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
    });
    
    for (const folder of day1Res.data.files) {
      console.log(`\nContents of ${folder.name}:`);
      const contentsRes = await drive.files.list({
        q: `'${folder.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, thumbnailLink, videoMediaMetadata, imageMediaMetadata)',
      });
      contentsRes.data.files.forEach(f => {
        console.log(`- ${f.name} (${f.mimeType})`);
        if (f.videoMediaMetadata) console.log(`  Video Meta: ${f.videoMediaMetadata.width}x${f.videoMediaMetadata.height}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
