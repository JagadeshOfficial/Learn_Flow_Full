'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Course } from '../data'

export default function ManageBatches({ courseId, initialCourses }: { courseId: string | null, initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses)
  const [batchName, setBatchName] = useState('')

  if (!courseId) return <div className="text-sm text-muted-foreground">Select a course to manage batches.</div>

  const course = courses.find(c => c.id === courseId)
  if (!course) return <div className="text-sm text-muted-foreground">Course not found.</div>

  function addBatch() {
    const name = batchName.trim()
    if (!name) return
    const id = `${course.id}-B${Date.now()}`
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, batches: [...c.batches, { id, name }] } : c))
    setBatchName('')
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{course.title}</h3>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground mb-2">Batches</div>
        <ul className="list-disc ml-5 space-y-1">
          {course.batches.map(b => (
            <li key={b.id} className="text-sm">{b.name}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <Label htmlFor="batchName">Add New Batch</Label>
        <Input id="batchName" value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="Batch name (e.g. Batch 4 - Weekend)" />
        <div className="flex justify-end">
          <Button onClick={addBatch} className="mt-2">Create Batch</Button>
        </div>
      </div>
    </div>
  )
}
