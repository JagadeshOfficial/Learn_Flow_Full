'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Course, Student } from '../data'
import { useToast } from '@/hooks/use-toast'

export default function CourseList({ initialCourses, initialStudents, initialOpenCourse }: { initialCourses: Course[]; initialStudents?: Student[]; initialOpenCourse?: string | null }) {
  const [courses, setCourses] = useState(() => (
    // clone and ensure batches have students arrays
    initialCourses.map(c => ({ ...c, batches: c.batches.map(b => ({ ...b, students: (b as any).students ?? [] })) }))
  ))
  const [openCourse, setOpenCourse] = useState<string | null>(initialOpenCourse ?? null)
  const [addingFor, setAddingFor] = useState<{ courseId: string; batchId: string } | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const { toast } = useToast()

  const [contents, setContents] = useState<any[]>([])
  const [loadingContents, setLoadingContents] = useState(true)

  useEffect(() => {
    async function fetchContents() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tutorToken') : null
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/v1/tutor/content', { headers })
        if (!res.ok) {
          setContents([])
          setLoadingContents(false)
          return
        }
        const data = await res.json()
        setContents(data || [])
      } catch (e) {
        setContents([])
      } finally {
        setLoadingContents(false)
      }
    }

    fetchContents()
  }, [])

  async function lookupStudentByEmail(email: string): Promise<Student | null> {
    // Try backend lookup first
    try {
      const res = await fetch(`/api/v1/students?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        return { id: data.id || data.studentId || data.email, name: data.name || data.fullName || data.email }
      }
    } catch (e) {
      // ignore
    }

    // Fallback: search initialStudents if provided
    if (initialStudents) {
      const found = initialStudents.find(s => s.name === email || (s as any).email === email)
      if (found) return found
    }

    return null
  }

  async function addStudent(courseId: string, batchId: string, email: string) {
    const emailTrim = email.trim()
    if (!emailTrim) return toast({ title: 'Email required', variant: 'destructive' })

    const student = await lookupStudentByEmail(emailTrim)
    if (!student) {
      return toast({ title: 'Student not found', description: 'No student found with that email', variant: 'destructive' })
    }

    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c
      return {
        ...c,
        batches: c.batches.map(b => {
          if (b.id !== batchId) return b
          const exists = (b.students || []).some(s => s.id === student.id)
          if (exists) return b
          return { ...b, students: [...(b.students || []), student] }
        })
      }
    }))

    setEmailInput('')
    setAddingFor(null)
    toast({ title: 'Student added', description: `${student.name} added to batch` })
  }

  function removeStudent(courseId: string, batchId: string, studentId: string) {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c
      return {
        ...c,
        batches: c.batches.map(b => b.id === batchId ? { ...b, students: (b.students || []).filter(s => s.id !== studentId) } : b)
      }
    }))
    toast({ title: 'Student removed' })
  }

  function addBatch(courseId: string, name: string) {
    const n = name.trim()
    if (!n) return
    const id = `${courseId}-B${Date.now()}`
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, batches: [...c.batches, { id, name: n, students: [] }] } : c))
  }

  // react to prop changes
  useEffect(() => {
    if (initialOpenCourse) setOpenCourse(initialOpenCourse)
  }, [initialOpenCourse])

  return (
    <div className="space-y-6">
      {courses.map(course => (
        <div key={course.id} className="border rounded p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <div className="text-sm text-muted-foreground">{course.batches.length} batches</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setOpenCourse(openCourse === course.id ? null : course.id)}>
                {openCourse === course.id ? 'Close' : 'Open'}
              </Button>
              <AddBatchInline onCreate={(name) => addBatch(course.id, name)} />
            </div>
          </div>

          {openCourse === course.id && (
            <div className="mt-4 space-y-3">
              {course.batches.map(batch => (
                <div key={batch.id} className="border rounded p-3 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{batch.name}</div>
                      <div className="text-sm text-muted-foreground">{(batch.students || []).length} students</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setAddingFor({ courseId: course.id, batchId: batch.id })}>Add Student</Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="grid gap-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Students</div>
                        <ul className="space-y-1">
                          {(batch.students || []).map(s => (
                            <li key={s.id} className="flex items-center justify-between">
                              <div>{s.name}</div>
                              <Button variant="link" size="sm" onClick={() => removeStudent(course.id, batch.id, s.id)}>Remove</Button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Uploaded Content</div>
                        {loadingContents ? (
                          <div className="text-sm text-muted-foreground">Loading content...</div>
                        ) : (
                          <ul className="space-y-2">
                            {contents.filter(it => it.courseId === course.id && it.batchId === batch.id).map(item => (
                              <li key={item.id} className="p-2 border rounded bg-white/5">
                                <div className="font-medium">{item.title || item.fileName || 'Untitled'}</div>
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                                {item.driveFileId ? (
                                  <div className="mt-2">
                                    <iframe src={`https://drive.google.com/file/d/${item.driveFileId}/preview`} width="320" height="180" title={item.title}></iframe>
                                  </div>
                                ) : item.url ? (
                                  <div className="mt-2">
                                    <a href={item.url} target="_blank" rel="noreferrer" className="text-primary">Open file</a>
                                  </div>
                                ) : null}
                              </li>
                            ))}
                            {contents.filter(it => it.courseId === course.id && it.batchId === batch.id).length === 0 && (
                              <li className="text-sm text-muted-foreground">No videos or files uploaded for this batch.</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {addingFor && addingFor.courseId === course.id && addingFor.batchId === batch.id && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                      <div className="sm:col-span-2">
                        <Label htmlFor={`email-${batch.id}`}>Student Email</Label>
                        <Input id={`email-${batch.id}`} value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="student@example.com" />
                      </div>
                      <div>
                        <Button onClick={() => addStudent(course.id, batch.id, emailInput)}>Add</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AddBatchInline({ onCreate }: { onCreate: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  return (
    <div>
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Add Batch</Button>
      ) : (
        <div className="flex items-center gap-2">
          <Input placeholder="Batch name" value={name} onChange={e => setName(e.target.value)} />
          <Button onClick={() => { onCreate(name); setName(''); setOpen(false) }}>Create</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      )}
    </div>
  )
}
