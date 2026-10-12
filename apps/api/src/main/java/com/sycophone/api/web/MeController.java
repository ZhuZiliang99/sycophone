package com.sycophone.api.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    public record MeResponse(String username, String role) {}

    @GetMapping
    public MeResponse me(Authentication authentication) {
        return new MeResponse(authentication.getName(),
                authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""));
    }
}