package com.kikiwiki.backend.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final UserRepository userRepository;

    public BudgetController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
    }

    @GetMapping
    public BudgetResponse get(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return new BudgetResponse(user.getMonthlyBudget());
    }

    @PutMapping
    public BudgetResponse update(@RequestBody BudgetRequest request, Authentication authentication) {
        if (request.getAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예산 금액이 필요합니다.");
        }

        User user = getCurrentUser(authentication);
        user.setMonthlyBudget(request.getAmount());
        userRepository.save(user);

        return new BudgetResponse(user.getMonthlyBudget());
    }
}
