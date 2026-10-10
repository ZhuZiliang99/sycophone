package com.sycophone.api.web;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class AnalyzeController {

    @GetMapping("/api/analyze")
    public AnalysisResponse analyze(@RequestParam String track) {
        return new AnalysisResponse(track, "ready");
    }

    public record AnalysisResponse(String track, String status) {}
}