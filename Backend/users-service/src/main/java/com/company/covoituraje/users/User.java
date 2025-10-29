package com.company.covoituraje.users;

import java.util.List;
import java.util.UUID;

public class User {
    private UUID id;
    private String email;
    private String sedeId;
    private String zone;
    private List<String> roles;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSedeId() { return sedeId; }
    public void setSedeId(String sedeId) { this.sedeId = sedeId; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
