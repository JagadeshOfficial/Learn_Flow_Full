'use client'

import { useState, useEffect } from 'react'
import { getBatches } from '@/lib/api-courses'
import { getFolders, createFolder, deleteFolder, updateFolder } from '@/lib/api-folders'
import { getFiles } from '@/lib/api-files'
import { tutorStudents } from '../content/data'
import CourseList from '../content/components/course-list'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { coursesData } from '@/lib/placeholder-data'

export default function TutorCoursesPage() {
    // Modal and form state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseTutor, setNewCourseTutor] = useState('');
    const [newCourseImage, setNewCourseImage] = useState<string | null>(null);
    const [newCourseImageName, setNewCourseImageName] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [manageBatchesCourse, setManageBatchesCourse] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [batchStudents, setBatchStudents] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [addStudentIds, setAddStudentIds] = useState<string[]>([])
  const [showManageBatches, setShowManageBatches] = useState(false)
  const router = useRouter()

  // Backend tutor courses state
  const [tutorCourses, setTutorCourses] = useState<any[]>([])
  const [tutorId, setTutorId] = useState<string | null>(null);

  // Get tutorId from localStorage on mount
  useEffect(() => {
    const storedTutorId = localStorage.getItem('tutorId');
    if (storedTutorId) {
      setTutorId(storedTutorId);
    }
  }, []);

  // Fetch courses from backend when tutorId is available
  useEffect(() => {
    fetch('http://localhost:8081/api/courses')
      .then(res => res.json())
      .then(data => setTutorCourses(Array.isArray(data) ? data : []));
  }, []);


  // Fetch batches for manage batches modal
  useEffect(() => {
    if (manageBatchesCourse) {
      getBatches(manageBatchesCourse.id).then((data) => {
        setBatches(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedBatchId(data[0].id);
        }
      });
      // Fetch all students for add-to-batch
      fetch('http://localhost:8081/api/students')
        .then(res => res.json())
        .then(data => setAllStudents(Array.isArray(data) ? data : []));
    }
  }, [manageBatchesCourse]);

  // Fetch students for selected batch with error handling (SQL-based endpoint)
  useEffect(() => {
    if (manageBatchesCourse && selectedBatchId) {
      fetch(`http://localhost:8081/api/tutor/courses/${manageBatchesCourse.id}/batches/${selectedBatchId}/students`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch students');
          return res.json();
        })
        .then(students => setBatchStudents(Array.isArray(students) ? students : []))
        .catch(() => setBatchStudents([]));
    }
  }, [manageBatchesCourse, selectedBatchId]);

  // Main content rendering
  return (
    <div className="max-w-7xl mx-auto py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Courses & Content</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your courses, batches, folders, and files.</p>
        </div>
        <div>
          <Button onClick={() => setShowAddModal(true)}>Add Course</Button>
        </div>
      </header>

      {/* Courses as cards with batch list and actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorCourses.map((course: any) => (
            <div key={course.id} className="bg-card border rounded p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                  <div className="text-muted-foreground text-sm mb-2">{course.description || 'No description'}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => {/* TODO: Edit course logic */}}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => {/* TODO: Delete course logic */}}>Delete</Button>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Batches:</div>
                <ul className="list-disc ml-5 mb-2">
                  {(course.batches || []).map((batch: any) => (
                    <li key={batch.id}>{batch.name}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setManageBatchesCourse(course);
                    setShowManageBatches(true);
                  }}>
                    Manage Batches ({course.batches ? course.batches.length : 0})
                  </Button>
                        {/* Manage Batches Modal */}
                        {showManageBatches && manageBatchesCourse && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40" onClick={() => {
                              setShowManageBatches(false);
                              setManageBatchesCourse(null);
                              setBatches([]);
                              setBatchStudents([]);
                              setSelectedBatchId(null);
                              setStudentSearch("");
                              setAddStudentIds([]);
                            }} />
                            <div className="relative bg-card rounded p-6 w-full max-w-2xl z-10">
                              <h3 className="text-lg font-semibold mb-4">Manage Batches - {manageBatchesCourse.title}</h3>
                              {batches.length === 0 ? (
                                <div className="text-muted-foreground">No batches found.</div>
                              ) : (
                                <>
                                  <div className="mb-4">
                                    <label className="block font-semibold mb-1">Select Batch</label>
                                    <select className="border rounded px-2 py-1 w-full" value={selectedBatchId || ""} onChange={e => setSelectedBatchId(e.target.value)}>
                                      {batches.map((batch: any) => (
                                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="font-semibold">Students</label>
                                      <span className="bg-primary text-white px-2 py-1 rounded text-xs">{batchStudents.length} students</span>
                                    </div>
                                    <input
                                      type="text"
                                      className="border rounded px-2 py-1 w-full mb-2"
                                      placeholder="Search by email..."
                                      value={studentSearch}
                                      onChange={e => setStudentSearch(e.target.value)}
                                    />
                                    <div className="max-h-40 overflow-y-auto">
                                      {batchStudents.length === 0 ? (
                                        <div className="text-muted-foreground text-sm px-2 py-2">No students found in this batch.</div>
                                      ) : (
                                        batchStudents
                                          .filter((student: any) =>
                                            !studentSearch || (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
                                          )
                                          .map((student: any) => (
                                            <div key={student.id} className="flex items-center justify-between border-b py-1">
                                              <span>{student.email}</span>
                                              <Button size="sm" variant="destructive" onClick={() => {
                                                fetch(`http://localhost:8081/api/courses/${manageBatchesCourse.id}/batches/${selectedBatchId}/students/${student.email}`, {
                                                  method: "DELETE"
                                                })
                                                  .then(res => {
                                                    if (!res.ok) throw new Error('Failed to remove student');
                                                    // Refresh students
                                                    return fetch(`http://localhost:8081/api/courses/${manageBatchesCourse.id}/batches/${selectedBatchId}/students`);
                                                  })
                                                  .then(res => res.json())
                                                  .then(students => setBatchStudents(Array.isArray(students) ? students : []))
                                                  .catch(() => setBatchStudents([]));
                                              }}>Delete</Button>
                                            </div>
                                          ))
                                      )}
                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <label className="font-semibold mb-1 block">Add Students to Batch:</label>
                                    <input
                                      type="text"
                                      className="border rounded px-2 py-1 w-full mb-2"
                                      placeholder="Search students by name or email"
                                      value={studentSearch}
                                      onChange={e => setStudentSearch(e.target.value)}
                                    />
                                    <div className="max-h-40 overflow-y-auto border rounded">
                                      {allStudents
                                        .filter((student: any) =>
                                          !studentSearch ||
                                          (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase())) ||
                                          (student.name && student.name.toLowerCase().includes(studentSearch.toLowerCase()))
                                        )
                                        .map((student: any) => (
                                          <div key={student.id} className="flex items-center gap-2 px-2 py-1">
                                            <input
                                              type="checkbox"
                                              checked={addStudentIds.includes(student.id)}
                                              onChange={e => {
                                                setAddStudentIds(ids =>
                                                  e.target.checked
                                                    ? [...ids, student.id]
                                                    : ids.filter(id => id !== student.id)
                                                );
                                              }}
                                            />
                                            <span>{student.name} <span className="text-muted-foreground text-xs">({student.email})</span></span>
                                          </div>
                                        ))}
                                    </div>
                                    <Button className="mt-2" onClick={async () => {
                                      // Add selected students to batch
                                      for (const studentId of addStudentIds) {
                                        const student = allStudents.find((s: any) => s.id === studentId);
                                        if (student) {
                                          try {
                                            await fetch(`http://localhost:8081/api/courses/${manageBatchesCourse.id}/batches/${selectedBatchId}/students`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ email: student.email })
                                            });
                                          } catch {}
                                        }
                                      }
                                      // Always refresh students after add
                                      fetch(`http://localhost:8081/api/courses/${manageBatchesCourse.id}/batches/${selectedBatchId}/students`)
                                        .then(res => res.json())
                                        .then(students => setBatchStudents(Array.isArray(students) ? students : []))
                                        .catch(() => setBatchStudents([]));
                                      setAddStudentIds([]);
                                    }}>Add Selected Students</Button>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="ghost" onClick={() => {
                                      setShowManageBatches(false);
                                      setManageBatchesCourse(null);
                                      setBatches([]);
                                      setBatchStudents([]);
                                      setSelectedBatchId(null);
                                      setStudentSearch("");
                                      setAddStudentIds([]);
                                    }}>Close</Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                  <Button size="sm" onClick={() => {/* TODO: Create batch logic */}}>
                    Create Batch
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ...existing code for Add Course Modal... */}
      {showAddModal && (
        // ...existing code for Add Course Modal...
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-card rounded p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="new-course-title">Course Title</Label>
                <Input id="new-course-title" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-course-tutor">Tutor Name</Label>
                <Input id="new-course-tutor" value={newCourseTutor} onChange={e => setNewCourseTutor(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new-course-image">Course Image (optional)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-muted'}`}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDrop={e => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0]
                    if (file && file.type.startsWith('image/')) {
                      setNewCourseImageName(file.name)
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result as string | null
                        if (result) setNewCourseImage(result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  onClick={() => document.getElementById('new-course-image-input')?.click()}
                >
                  {newCourseImage ? (
                    <img src={newCourseImage} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                  ) : (
                    <span className="text-muted-foreground">Drag & drop or click to upload</span>
                  )}
                  <input
                    id="new-course-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (!file) return
                      setNewCourseImageName(file.name)
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result as string | null
                        if (result) setNewCourseImage(result)
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
                {newCourseImageName && <div className="text-xs text-muted-foreground mt-1">{newCourseImageName}</div>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={async () => {
                const title = newCourseTitle.trim();
                if (!title) return;
                // Get tutorId from localStorage
                const tutorId = localStorage.getItem('tutorId');
                if (!tutorId) {
                  alert('Tutor ID not found. Please log in again.');
                  return;
                }
                // Prepare course data for backend
                const courseData = {
                  title,
                  tutorName: newCourseTutor,
                  tutorId,
                  image: newCourseImage || undefined
                };
                try {
                  const res = await fetch('http://localhost:8081/courses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(courseData)
                  });
                  if (!res.ok) {
                    throw new Error('Failed to add course');
                  }
                  // Refresh courses (fetch by tutorId)
                  setNewCourseTitle('');
                  setNewCourseTutor('');
                  setNewCourseImage('');
                  setNewCourseImageName(null);
                  setShowAddModal(false);
                  // Optionally, reload the page or refetch courses here
                } catch (err) {
                  alert('Error adding course. Please check your backend and network.');
                }
              }}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* ...existing code for course cards and list... */}
    </div>
  );
}
