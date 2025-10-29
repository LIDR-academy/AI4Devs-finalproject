package com.company.covoituraje.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO compartido para información de usuarios entre servicios
 */
public class UserDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("email")
    public String email;
    
    @JsonProperty("sedeId")
    public String sedeId;
    
    @JsonProperty("role")
    public String role;
    
    @JsonProperty("createdAt")
    public String createdAt;
    
    @JsonProperty("updatedAt")
    public String updatedAt;
}
