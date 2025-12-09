// frontend/src/lib/api-files.ts

export async function getFiles(folderId) {
  const res = await fetch(`http://localhost:8081/api/folders/${folderId}/files`);
  return res.json();
}
