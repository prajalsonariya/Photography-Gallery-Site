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

    const res = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink)',
      pageSize: 1
    });

    if (res.data.files.length > 0) {
      const file = res.data.files[0];
      console.log('Thumbnail link:', file.thumbnailLink);
      
      const thumbUrl = file.thumbnailLink.replace(/=s\d+$/, '=s1000');
      console.log('Fetching', thumbUrl);
      
      // Try to fetch it without auth
      const fetchRes = await fetch(thumbUrl);
      console.log('Status without auth:', fetchRes.status);
      
      // Try with auth
      const token = await auth.getAccessToken();
      const fetchResAuth = await fetch(thumbUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Status with auth:', fetchResAuth.status);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
