# Video Platform Architecture (MVP)

## Idea
Hybrid YouTube + Social Network with multi-storage system.

## Core Principle
Do NOT search across storages.
Store direct URL and storage info in database.

## Example DB Schema
```json
{
  "id": "vid123",
  "title": "My video",
  "storage": "cloudinary",
  "url": "https://cdn.example.com/video.mp4",
  "created_at": "2026-01-01"
}
```

## Upload Logic (Node.js example)
```js
async function uploadVideo(file) {
  if (file.size < 10 * 1024 * 1024) {
    return await uploadToFirebase(file);
  } else {
    return await uploadToCloudinary(file);
  }
}
```

## Fetch Logic
```js
async function getVideo(id) {
  const video = await db.get(id);
  return video.url;
}
```

## Stack
- Frontend: React / React Native
- Backend: Supabase or Firebase
- Storage: Cloudinary + Firebase Storage

## Notes
- Limit video size (<=30s, 720p)
- Use CDN for speed
- Store only links in DB

---
MVP ready 🚀
