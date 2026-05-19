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
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    console.log('Testing Drive API...');
    console.log('Root Folder ID:', rootFolderId);

    const res = await drive.files.list({
      q: `'${rootFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink)',
    });

    console.log('Files in root folder:');
    res.data.files.forEach(f => {
      console.log(`- ${f.name} (${f.mimeType})`);
      if (f.thumbnailLink) {
        console.log(`  Thumbnail: ${f.thumbnailLink}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
