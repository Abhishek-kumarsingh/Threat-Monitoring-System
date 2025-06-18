package com.threatanalysis.dto;

import lombok.Data;

@Data
public class MLPredictionResponse {
    private String threatType;
    private String severity;
    private Double confidenceScore;
    private Double riskScore;
    private String description;
    private String recommendedAction;
    private String modelVersion;
    private Long processingTimeMs;
    private String timestamp;
}
