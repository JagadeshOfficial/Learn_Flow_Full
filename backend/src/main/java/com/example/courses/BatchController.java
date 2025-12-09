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
@RequestMapping("/courses/{courseId}/batches")
@CrossOrigin(origins = "*")
public class BatchController {

    @PostMapping
    public ResponseEntity<String> addBatch(@PathVariable String courseId, @RequestBody Map<String, Object> batchRequest) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Map<String, Object> batch = new HashMap<>();
        batch.put("name", batchRequest.get("name"));
        batch.put("courseId", courseId);
        batch.put("createdAt", FieldValue.serverTimestamp());
        batch.put("updatedAt", FieldValue.serverTimestamp());
        db.collection("batches").add(batch);
        return ResponseEntity.ok("Batch added successfully");
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getBatches(@PathVariable String courseId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection("batches").whereEqualTo("courseId", courseId).get();
        List<Map<String, Object>> batches = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            batches.add(doc.getData());
        }
        return ResponseEntity.ok(batches);
    }
}
