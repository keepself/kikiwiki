package com.kikiwiki.backend.budget;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final MonthlyBudgetRepository monthlyBudgetRepository;

    public BudgetController(MonthlyBudgetRepository monthlyBudgetRepository) {
        this.monthlyBudgetRepository = monthlyBudgetRepository;
    }

    private MonthlyBudget getOrCreate(String month) {
        return monthlyBudgetRepository.findByMonth(month)
                .orElseGet(() -> new MonthlyBudget(month));
    }

    @GetMapping
    public BudgetResponse get(@RequestParam("month") String month) {
        return monthlyBudgetRepository.findByMonth(month)
                .map(budget -> new BudgetResponse(budget.getAmount(), budget.isSavingsModeEnabled()))
                .orElseGet(() -> new BudgetResponse(null, false));
    }

    @PutMapping
    public BudgetResponse update(@RequestParam("month") String month, @RequestBody BudgetRequest request) {
        if (request.getAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예산 금액이 필요합니다.");
        }

        MonthlyBudget budget = getOrCreate(month);
        budget.updateAmount(request.getAmount());
        MonthlyBudget saved = monthlyBudgetRepository.save(budget);

        return new BudgetResponse(saved.getAmount(), saved.isSavingsModeEnabled());
    }

    // 절약모드 on/off도 월별로 저장 (예산을 아직 안 정했어도 켤 수 있음)
    @PutMapping("/savings-mode")
    public BudgetResponse updateSavingsMode(@RequestParam("month") String month, @RequestBody SavingsModeRequest request) {
        MonthlyBudget budget = getOrCreate(month);
        budget.setSavingsModeEnabled(request.isEnabled());
        MonthlyBudget saved = monthlyBudgetRepository.save(budget);

        return new BudgetResponse(saved.getAmount(), saved.isSavingsModeEnabled());
    }
}
