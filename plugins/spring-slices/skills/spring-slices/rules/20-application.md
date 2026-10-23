# Rule: `application/` — services, own the logic

Interface in `application/` + `*Impl`, `@Service @RequiredArgsConstructor`.

- **All** business logic, orchestration, and transaction boundaries live here: `@Transactional` (`readOnly = true` for reads).
- Services inject repositories (`data/`), mappers, and other services' interfaces.
- Return DTOs to controllers (map before returning); may return entities to other services.
- Controllers depend on the interface, so the impl stays swappable — never expose the impl.
