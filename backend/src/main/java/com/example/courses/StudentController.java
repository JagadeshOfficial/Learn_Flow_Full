package com.example.courses;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/courses/{courseId}/batches/{batchId}/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @PostMapping
    public ResponseEntity<String> addStudentToBatch(@PathVariable String courseId, @PathVariable String batchId, @RequestBody Map<String, Object> studentRequest) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Map<String, Object> student = new HashMap<>();
        student.put("email", studentRequest.get("email"));
        student.put("courseId", courseId);
        student.put("batchId", batchId);
        student.put("createdAt", FieldValue.serverTimestamp());
        db.collection("students").add(student);
        return ResponseEntity.ok("Student added to batch successfully");
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getStudentsInBatch(@PathVariable String courseId, @PathVariable String batchId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection("students").whereEqualTo("courseId", courseId).whereEqualTo("batchId", batchId).get();
        List<Map<String, Object>> students = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            students.add(doc.getData());
        }
        return ResponseEntity.ok(students);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<String> removeStudentFromBatch(@PathVariable String courseId, @PathVariable String batchId, @PathVariable String email) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection("students").whereEqualTo("courseId", courseId).whereEqualTo("batchId", batchId).whereEqualTo("email", email).get();
        List<DocumentSnapshot> docs = future.get().getDocuments();
        for (DocumentSnapshot doc : docs) {
            doc.getReference().delete();
        }
        return ResponseEntity.ok("Student removed from batch successfully");
    }
}
