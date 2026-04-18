/**
 * Seed sample data + admin user into data/db.json
 * Usage: node scripts/seed.js
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {
  initDb,
  createUser,
  findUserByEmail,
  insertMoviesIfEmpty,
} from '../src/db/store.js';

const SAMPLE = [
  {
    title: 'Big Buck Bunny',
    description:
      'Open movie — great for testing MP4 playback. A giant rabbit teaches tiny rodents respect.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genre: ['Animation', 'Family'],
    releaseYear: 2008,
    isFeatured: true,
    isSeries: false,
    episodes: [],
  },
  {
    title: 'Elephants Dream (HLS demo)',
    description: 'Stream test — HLS .m3u8 (if your browser supports it via hls.js).',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    genre: ['Sci-Fi', 'Animation'],
    releaseYear: 2006,
    isFeatured: true,
    isSeries: false,
    episodes: [],
  },
  {
    title: 'Sample Series',
    description: 'Two short episodes using the same sample CDN.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    genre: ['Action'],
    releaseYear: 2020,
    isFeatured: false,
    isSeries: true,
    episodes: [
      {
        title: 'Pilot',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        episodeNumber: 1,
      },
      {
        title: 'Reunion',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        episodeNumber: 2,
      },
    ],
  },
];

async function run() {
  initDb();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@streamflix.local';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin123456';

  if (!findUserByEmail(adminEmail)) {
    const hash = await bcrypt.hash(adminPass, 12);
    createUser({ name: 'Admin', email: adminEmail, password: hash, role: 'admin' });
    console.log('Created admin:', adminEmail, '/ password:', adminPass);
  } else {
    console.log('Admin exists:', adminEmail);
  }

  insertMoviesIfEmpty(SAMPLE);
  console.log('Done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
