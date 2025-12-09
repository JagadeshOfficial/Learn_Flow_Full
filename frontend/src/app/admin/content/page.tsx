"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getCourses, getBatches } from "@/lib/api-courses";
import { createFolder, getFolders, deleteFolder, updateFolder } from "@/lib/api-folders";
import { getFiles } from "@/lib/api-files";

interface BreadcrumbsProps {
  course: any;
  batch: any;
  folderPath: any[];
  onNavigate: (type: string, folder?: any) => void;
}

function Breadcrumbs({ course, batch, folderPath, onNavigate }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 mb-4 text-lg">
      <Button variant="ghost" onClick={() => onNavigate('course')}>{course?.title}</Button>
      {batch && <span>&gt;</span>}
      {batch && <Button variant="ghost" onClick={() => onNavigate('batch')}>{batch.name}</Button>}
      {folderPath.map((folder: any, idx: number) => (
        <span key={folder.id}>
          &gt; <Button variant="ghost" onClick={() => onNavigate('folder', folder)}>{folder.name}</Button>
        </span>
      ))}
    </div>
  );
}

export default function AdminContentPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [folderPath, setFolderPath] = useState<any[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadBatchId, setUploadBatchId] = useState<number | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<number | null>(null);
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadLoadedMB, setUploadLoadedMB] = useState<number>(0);
  const [uploadTotalMB, setUploadTotalMB] = useState<number>(0);

  useEffect(() => {
    getCourses().then((data) => setCourses(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      getBatches(selectedCourse.id).then((data) => setBatches(Array.isArray(data) ? data : []));
      setSelectedBatch(null);
      setFolders([]);
      setSelectedFolder(null);
      setFolderPath([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedBatch) {
      getFolders(selectedBatch.id).then((data) => setFolders(Array.isArray(data) ? data : []));
      setSelectedFolder(null);
      setFolderPath([]);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedFolder) {
      getFolders(selectedBatch.id).then((data) => setFolders(Array.isArray(data) ? data : []));
      getFiles(selectedFolder.id).then((data) => setFiles(Array.isArray(data) ? data : []));
      setFolderPath((prev) => {
        const idx = prev.findIndex(f => f.id === selectedFolder.id);
        if (idx !== -1) return prev.slice(0, idx + 1);
        return [...prev, selectedFolder];
      });
    } else {
      setFiles([]);
    }
  }, [selectedFolder]);

  function handleNavigate(type: string, folder?: any) {
    if (type === 'course') {
      setSelectedCourse(null);
      setSelectedBatch(null);
      setSelectedFolder(null);
      setFolderPath([]);
    } else if (type === 'batch') {
      setSelectedBatch(null);
      setSelectedFolder(null);
      setFolderPath([]);
    } else if (type === 'folder') {
      setSelectedFolder(folder);
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName || !selectedBatch) return;
    const parentId = selectedFolder?.id || null;
    const folder = await createFolder(selectedBatch.id, newFolderName, parentId);
    if (folder && folder.id) {
      toast({ title: "Folder created!" });
      setShowCreateFolder(false);
      setNewFolderName("");
      getFolders(selectedBatch.id).then((data) => setFolders(Array.isArray(data) ? data : []));
    } else {
      toast({ title: "Failed to create folder" });
    }
  }

  function openUploadModal() {
    setShowUploadModal(true);
    setUploadBatchId(selectedBatch?.id || null);
    setUploadFolderId(selectedFolder?.id || null);
    setUploadFileObj(null);
    setUploadProgress(0);
    setUploadLoadedMB(0);
    setUploadTotalMB(0);
  }

  function handleUploadInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setUploadFileObj(file);
    if (file) setUploadTotalMB(file.size / (1024 * 1024));
  }

  async function handleUploadSubmit() {
    if (!uploadBatchId || !uploadFolderId || !uploadFileObj) {
      toast({ title: "Select batch, folder, and file" });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadLoadedMB(0);
    // Simulate upload with progress
    const total = uploadFileObj.size;
    let loaded = 0;
    const chunk = total / 20;
    function simulateProgress() {
      if (loaded < total) {
        loaded += chunk;
        if (loaded > total) loaded = total;
        setUploadProgress(Math.round((loaded / total) * 100));
        setUploadLoadedMB(loaded / (1024 * 1024));
        setTimeout(simulateProgress, 150);
      } else {
        setUploading(false);
        setShowUploadModal(false);
        toast({ title: "File uploaded!" });
        getFiles(uploadFolderId).then((data) => setFiles(Array.isArray(data) ? data : []));
      }
    }
    simulateProgress();
    // TODO: Replace with actual upload API call using fetch/XHR and onprogress
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Manage Content</h1>
      <Breadcrumbs course={selectedCourse} batch={selectedBatch} folderPath={folderPath} onNavigate={handleNavigate} />
      {/* Courses */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Courses</h2>
        <div className="flex gap-2">
          {courses.map((course) => (
            <Button key={course.id} onClick={() => setSelectedCourse(course)} variant={selectedCourse?.id === course.id ? "default" : "outline"}>
              {course.title}
            </Button>
          ))}
        </div>
      </div>
      {/* Batches */}
      {selectedCourse && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Batches</h2>
          <div className="flex gap-2">
            {batches.map((batch) => (
              <Button key={batch.id} onClick={() => setSelectedBatch(batch)} variant={selectedBatch?.id === batch.id ? "default" : "outline"}>
                {batch.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Folders & Upload */}
      {selectedBatch && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-2">Folders</h2>
            <div className="flex gap-4 mb-4">
              <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
                + Create Folder
              </Button>
            </div>
            {/* Upload button below selected folder */}
            {selectedFolder && (
              <div className="flex gap-4 mb-4">
                <Button variant="outline" onClick={openUploadModal}>
                  ⬆️ Upload File/Video
                </Button>
              </div>
            )}
            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Upload File/Video</h3>
                  <div className="mb-3">
                    <label className="block mb-1">Select Batch</label>
                    <select className="border rounded px-2 py-1 w-full" value={uploadBatchId ?? ''} onChange={e => setUploadBatchId(Number(e.target.value))}>
                      <option value="" disabled>Select batch</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1">Select Folder</label>
                    <select className="border rounded px-2 py-1 w-full" value={uploadFolderId ?? ''} onChange={e => setUploadFolderId(Number(e.target.value))}>
                      <option value="" disabled>Select folder</option>
                      {folders.filter(f => f.batch?.id === uploadBatchId).map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1">Choose File/Video</label>
                    <input type="file" accept="video/*,application/*" onChange={handleUploadInputChange} disabled={uploading} />
                  </div>
                  {uploading && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded h-4 mb-1">
                        <div className="bg-blue-500 h-4 rounded" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <div className="text-sm text-gray-700">{uploadProgress}% &nbsp;|&nbsp; {uploadLoadedMB.toFixed(2)} MB / {uploadTotalMB.toFixed(2)} MB</div>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowUploadModal(false)} disabled={uploading}>Cancel</Button>
                    <Button onClick={handleUploadSubmit} disabled={uploading || !uploadFileObj || !uploadBatchId || !uploadFolderId}>Upload</Button>
                  </div>
                </div>
              </div>
            )}
            {showCreateFolder && (
              <div className="mt-2 flex gap-2">
                <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name" className="border px-2 py-1 rounded" />
                <Button onClick={handleCreateFolder}>Save</Button>
              </div>
            )}
            <div className="flex gap-2 mb-2">
              {folders
                .filter(f => (selectedFolder ? f.parent?.id === selectedFolder.id : !f.parent))
                .map((folder) => (
                  <div key={folder.id} className="flex items-center gap-2">
                    <Button onClick={() => setSelectedFolder(folder)} variant={selectedFolder?.id === folder.id ? "default" : "outline"}>
                      {folder.name}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      if (confirm('Delete this folder?')) {
                        try {
                          const res = await deleteFolder(folder.id);
                          if (res && res.success !== false) {
                            toast({ title: "Folder deleted!" });
                            const updatedFolders = await getFolders(selectedBatch.id);
                            setFolders(Array.isArray(updatedFolders) ? updatedFolders : []);
                            if (selectedFolder?.id === folder.id) setSelectedFolder(null);
                          } else {
                            toast({ title: "Failed to delete folder", description: res?.message || undefined });
                          }
                        } catch (err) {
                          toast({ title: "Error deleting folder" });
                        }
                      }
                    }}>🗑️</Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      const newName = prompt('Edit folder name:', folder.name);
                      if (newName && newName !== folder.name) {
                        try {
                          const res = await updateFolder(folder.id, newName);
                          if (res && res.success !== false) {
                            toast({ title: "Folder name updated!" });
                            const updatedFolders = await getFolders(selectedBatch.id);
                            setFolders(Array.isArray(updatedFolders) ? updatedFolders : []);
                          } else {
                            toast({ title: "Failed to update folder name", description: res?.message || undefined });
                          }
                        } catch (err) {
                          toast({ title: "Error updating folder name" });
                        }
                      }
                    }}>✏️</Button>
                  </div>
                ))}
            </div>
            {/* Files/Videos in folder */}
            {selectedFolder && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Files & Videos</h3>
                {files.length === 0 ? (
                  <p className="text-muted-foreground">No files in this folder.</p>
                ) : (
                  <ul className="space-y-2">
                    {files.map(file => (
                      <li key={file.id} className="border rounded p-2 flex items-center gap-2">
                        <span>{file.name}</span>
                        {/* Add preview/download/play logic here */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
