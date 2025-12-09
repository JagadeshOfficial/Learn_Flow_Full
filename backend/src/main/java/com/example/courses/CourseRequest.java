package com.example.courses;

import java.util.Map;

public class CourseRequest {
    private String title;
    private String tutorName;
    private String tutorId;
    private String image;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }
    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
