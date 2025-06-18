package com.threatanalysis.client;

import com.threatanalysis.dto.MLPredictionRequest;
import com.threatanalysis.dto.MLPredictionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ml-service", url = "${ml-service.url}")
public interface MLServiceClient {
    
    @PostMapping("/predict")
    MLPredictionResponse predictThreat(@RequestBody MLPredictionRequest request);
}
