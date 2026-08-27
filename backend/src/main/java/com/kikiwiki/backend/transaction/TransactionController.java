package com.kikiwiki.backend.transaction;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@RequestBody TransactionRequest request) {
        Transaction transaction = new Transaction(
                request.getAmount(),
                request.getType(),
                request.getCategory(),
                request.getDescription(),
                request.getTransactionDate()
        );

        Transaction saved = transactionRepository.save(transaction);

        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionResponse(saved));
    }

    @GetMapping
    public List<TransactionResponse> getAll() {
        return transactionRepository.findAll()
                .stream()
                .map(TransactionResponse::new)
                .toList();
    }
}
