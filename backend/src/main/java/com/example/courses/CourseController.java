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
@RequestMapping("/courses")
@CrossOrigin(origins = "*")
public class CourseController {


    @PostMapping
    public ResponseEntity<String> addCourse(@RequestBody CourseRequest courseRequest) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Map<String, Object> course = new HashMap<>();
        course.put("title", courseRequest.getTitle());
        course.put("tutorName", courseRequest.getTutorName());
        course.put("tutorId", courseRequest.getTutorId());
        course.put("image", courseRequest.getImage());
        course.put("createdAt", FieldValue.serverTimestamp());
        course.put("updatedAt", FieldValue.serverTimestamp());
        db.collection("courses").add(course);
        return ResponseEntity.ok("Course added successfully");
    }

    // New endpoint: Get all courses
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCourses() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection("courses").get();
        List<Map<String, Object>> courses = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            courses.add(doc.getData());
        }
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Map<String, Object>>> getCoursesByTutor(@PathVariable String tutorId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection("courses").whereEqualTo("tutorId", tutorId).get();
        List<Map<String, Object>> courses = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            courses.add(doc.getData());
        }
        return ResponseEntity.ok(courses);
    }
}
