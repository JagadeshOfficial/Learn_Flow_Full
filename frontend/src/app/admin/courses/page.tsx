"use client";

import { useState, useEffect } from "react";
import { getCourses, deleteCourse, updateCourse, createCourse } from "@/lib/api-courses";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentMultiSelect, StudentOption } from "@/components/ui/StudentMultiSelect";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Batch = {
  id: string | number;
  name: string;
};

type Course = {
  id: string | number;
  title: string;
  description: string;
  batches: Batch[];
};

export default function AdminCoursesPage() {
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showManageBatches, setShowManageBatches] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");
      try {
        const data = await getCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Create Course Form
  function CreateCourseForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
      setLoading(true);
      try {
        const newCourse = await createCourse({ title, description });
        setCourses((prev) => [...prev, newCourse]);
        setShowCreateCourse(false);
        toast({ title: "Course created successfully!" });
      } catch (err) {
        toast({ title: "Failed to create course", description: String(err), });
      } finally {
        setLoading(false);
      }
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 w-full"
            placeholder="Course Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading || !title.trim()}
          >
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </DialogContent>
    );
  }

  // Create Batch Form
  function CreateBatchForm() {
    const [batchName, setBatchName] = useState("");

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Batch Name (e.g. 2025 Jan)"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <Button
            onClick={() => {
              // TODO: Implement actual create batch
              setShowCreateBatch(false);
            }}
          >
            Create Batch
          </Button>
        </div>
      </DialogContent>
    );
  }

  // Manage Batches Popup
  function ManageBatchesPopup({ onClose }: { onClose: () => void }) {
        async function handleAddStudent() {
          if (!studentEmail || !selectedBatchId || !selectedCourse) return;
          try {
            await import("@/lib/api-courses").then(({ addStudentToBatch }) =>
              addStudentToBatch(selectedCourse.id, selectedBatchId, studentEmail)
            );
            setStudentEmail("");
            // Optionally, refresh courses from backend here for up-to-date students
            toast({ title: "Student added to batch!" });
          } catch (err) {
            toast({ title: "Failed to add student", description: String(err) });
          }
        }
    const [selectedBatchId, setSelectedBatchId] = useState<string | number>(selectedCourse?.batches?.[0]?.id || "");
    useEffect(() => {
      // Reset selected students and search when batch changes
      setSelectedStudentIds([]);
      setSearchTerm("");
      setSearchEmail("");
    }, [selectedBatchId]);
    const [studentEmail, setStudentEmail] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [allStudents, setAllStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    // Fetch all students from backend API when modal opens
    useEffect(() => {
      async function fetchStudents() {
        try {
          const res = await fetch("http://localhost:8081/api/v1/auth/admin/students");
          if (!res.ok) throw new Error("Failed to fetch students");
          const data = await res.json();
          // Support both {students: [...]} and [...]
          const arr = Array.isArray(data) ? data : data.students || [];
          const students: StudentOption[] = arr.map((s: any) => ({
            id: String(s.id),
            name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
            email: s.email,
          }));
          setAllStudents(students);
        } catch (err) {
          setAllStudents([]);
        }
      }
      fetchStudents();
    }, []);

    // Find the selected batch object
    const selectedBatch = selectedCourse?.batches?.find(
      (batch) => batch.id === selectedBatchId
    );
    // Get students from batch object
    const currentStudents = selectedBatch?.students || [];
    const filteredStudents = searchEmail
      ? currentStudents.filter((student) =>
          student.email.toLowerCase().includes(searchEmail.toLowerCase())
        )
      : currentStudents;

    async function handleDeleteStudent(studentId: string) {
      if (!selectedBatchId || !selectedCourse) return;
      try {
        await import("@/lib/api-courses").then(({ removeStudentFromBatch }) =>
          removeStudentFromBatch(selectedCourse.id, selectedBatchId, studentId)
        );
        toast({ title: "Student deleted from batch!" });
        // Optionally, refresh courses from backend here for up-to-date students
        const updatedCourses = await getCourses();
        setCourses(Array.isArray(updatedCourses) ? updatedCourses : []);
      } catch (err) {
        toast({ title: "Failed to delete student", description: String(err) });
      }
    }

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Batches - {selectedCourse?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Select Batch</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedBatchId}
              onChange={(e) => {
                // Always store as number for backend compatibility
                const val = e.target.value;
                setSelectedBatchId(val ? Number(val) : "");
              }}
            >
              <option value="">Select a batch</option>
              {selectedCourse?.batches?.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBatchId && (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Students</span>
                  <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                    {filteredStudents.length} students
                  </span>
                </div>
                <input
                  className="w-full border rounded px-3 py-2 mb-3"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded bg-white">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center bg-background p-3 rounded border"
                      >
                        <span className="font-mono text-sm">{student.email}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No students found.</p>
                  )}
                </div>
              </div>
              {/* Single module: Multi-select dropdown for students from database only */}
              <div className="mt-6">
                <label className="block mb-2 font-medium">Add Students to Batch:</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Search students by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <StudentMultiSelect
                  options={allStudents.filter(
                    (s) =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  selected={selectedStudentIds}
                  onChange={setSelectedStudentIds}
                />
                <Button
                  type="button"
                  className="mt-2"
                  onClick={async () => {
                    if (!selectedBatchId || !selectedCourse) return;
                    const selectedEmails = allStudents
                      .filter((s) => selectedStudentIds.includes(s.id))
                      .map((s) => s.email)
                      .filter((email) => !currentStudents.some((stu) => stu.email === email));
                    let successCount = 0;
                    let errorMessages = [];
                    for (const email of selectedEmails) {
                      const result = await import("@/lib/api-courses").then(({ addStudentToBatch }) =>
                        addStudentToBatch(selectedCourse.id, Number(selectedBatchId), email)
                      );
                      // Only show error if backend returns failure
                      if (result && result.success) {
                        successCount++;
                      } else if (result && result.message && !result.message.includes("already in batch")) {
                        errorMessages.push(result.message || `Failed to add ${email}`);
                      }
                    }
                    setSelectedStudentIds([]);
                    setSearchTerm("");
                    // Always refresh courses to update batch students
                    const updatedCourses = await getCourses();
                    setCourses(Array.isArray(updatedCourses) ? updatedCourses : []);
                    // Show success only if students were actually added
                    if (successCount > 0) {
                      toast({ title: `${successCount} students added!` });
                    }
                    // Only show error if there are real failures (not duplicates)
                    if (errorMessages.length > 0) {
                      toast({ title: "Some errors occurred", description: errorMessages.join("; ") });
                    }
                  }}
                  disabled={selectedStudentIds.length === 0}
                >
                  Add Selected Students
                </Button>
              </div>
            </>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    );
  }

  // Rename Course Form
  function RenameCourseForm({ course }: { course: Course }) {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      setLoading(true);
      try {
        await updateCourse(course.id, { title, description });
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, title, description } : c))
        );
        toast({ title: "Course updated successfully!" });
      } catch (err) {
        toast({ title: "Failed to update course", description: String(err) });
      }
      setLoading(false);
    };

    return (
      <div className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    );
  }

  const handleDeleteCourse = async (courseId: string | number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        toast({ title: "Course deleted successfully!" });
      } catch (err) {
        toast({ title: "Failed to delete course", description: String(err) });
      }
    }
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage all courses and their batches.
          </p>
        </div>

        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogTrigger asChild>
            <Button>Create Course</Button>
          </DialogTrigger>
          <CreateCourseForm />
        </Dialog>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center">
            No courses yet. Create your first one!
          </p>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{course.title}</CardTitle>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rename Course</DialogTitle>
                      </DialogHeader>
                      <RenameCourseForm course={course} />
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground">{course.description}</p>

                {/* Display batches directly under each course */}
                {course.batches && course.batches.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Batches:</h4>
                    <ul className="list-disc ml-6">
                      {course.batches.map((batch) => (
                        <li key={batch.id}>{batch.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Dialog
                    open={showManageBatches && selectedCourse?.id === course.id}
                    onOpenChange={(open) => {
                      setShowManageBatches(open);
                      if (open) setSelectedCourse(course);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Manage Batches ({course.batches.length})
                      </Button>
                    </DialogTrigger>
                    <ManageBatchesPopup onClose={() => setShowManageBatches(false)} />
                  </Dialog>

                  <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
                    <DialogTrigger asChild>
                      <Button size="sm">Create Batch</Button>
                    </DialogTrigger>
                    <CreateBatchForm />
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}