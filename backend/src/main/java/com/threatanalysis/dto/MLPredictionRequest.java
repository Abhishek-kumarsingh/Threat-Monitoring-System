package com.threatanalysis.dto;

import lombok.Data;

@Data
public class MLPredictionRequest {
    private String sourceIp;
    private String destinationIp;
    private Integer sourcePort;
    private Integer destinationPort;
    private String protocol;
    private Long packetSize;
    private Long bytesSent;
    private Long bytesReceived;
    private Long duration;
    private String userAgent;
    private String requestMethod;
    private String requestUrl;
    private Integer responseCode;
    private String country;
    private String region;
    private String city;
}
