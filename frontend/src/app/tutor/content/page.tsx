
"use client";
import { useEffect, useState } from "react";
import { getCourses, getBatches } from "@/lib/api-courses";
import { getFolders } from "@/lib/api-folders";
import { getFiles } from "@/lib/api-files";
import { Button } from "@/components/ui/button";

export default function TutorContentPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);


  // Fetch all courses (like admin)
  useEffect(() => {
    fetch('http://localhost:8081/api/courses')
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []));
  }, []);

  // Fetch batches for selected course
  useEffect(() => {
    if (selectedCourse) {
      getBatches(selectedCourse.id).then((data) => setBatches(Array.isArray(data) ? data : []));
      setSelectedBatch(null);
      setFolders([]);
      setSelectedFolder(null);
      setFiles([]);
    }
  }, [selectedCourse]);

  // Fetch folders for selected batch
  useEffect(() => {
    if (selectedBatch) {
      getFolders(selectedBatch.id).then((data) => setFolders(Array.isArray(data) ? data : []));
      setSelectedFolder(null);
      setFiles([]);
    }
  }, [selectedBatch]);

  // Fetch files for selected folder
  useEffect(() => {
    if (selectedFolder) {
      getFiles(selectedFolder.id).then((data) => setFiles(Array.isArray(data) ? data : []));
    }
  }, [selectedFolder]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Content</h1>
        <p className="text-lg text-muted-foreground mt-2">View and manage your course content, batches, folders, and files.</p>
      </header>

      <section className="grid gap-6">
        {/* Courses */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Courses</h2>
          <div className="flex gap-2 flex-wrap">
            {courses.map((course: any) => (
              <Button key={course.id} variant={selectedCourse?.id === course.id ? "default" : "outline"} onClick={() => setSelectedCourse(course)}>
                {course.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Batches */}
        {selectedCourse && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Batches</h2>
            <div className="flex gap-2 flex-wrap">
              {batches.map((batch: any) => (
                <Button key={batch.id} variant={selectedBatch?.id === batch.id ? "default" : "outline"} onClick={() => setSelectedBatch(batch)}>
                  {batch.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Folders */}
        {selectedBatch && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Folders</h2>
            <div className="flex gap-2 flex-wrap">
              {folders.map((folder: any) => (
                <Button key={folder.id} variant={selectedFolder?.id === folder.id ? "default" : "outline"} onClick={() => setSelectedFolder(folder)}>
                  {folder.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {selectedFolder && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Files</h2>
            <ul className="list-disc ml-5 text-sm">
              {files.map((file: any) => (
                <li key={file.id}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
