require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const USERNAME = 'sAdmin';
const NEW_PASSWORD = ''; // <- upiši lozinku ovde, sam

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
  const result = await db.collection('users').updateOne(
    { username: USERNAME },
    { $set: { passwordHash } }
  );
  console.log(result.matchedCount ? 'Lozinka ažurirana.' : `Korisnik "${USERNAME}" nije pronađen.`);
  await client.close();
}

main().catch(console.error);