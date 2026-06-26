## Prompt 1: Specs from refined ticket
/speckit-specify docs/tickets/extendedMVP/EXT-008-mercadona-price-comparison.md

## Prompt 2: Plan
/speckit-plan (with spec.md as context)


## Prompt 3: Tasks
/speckit-tasks (with plan.md as context)

## Prompt 4: Implement
/speckit-implement (with tasks.md as context)

## Prompt 5: Fix after manual review
After a manual review and test, when I try to test the Mercadona API always reply with "WARN [MercadonaService] Mercadona API responded with 404 for query "rodajas salmon"" for all products. Any option or product to test? I think the search funtionality is not working. Fix it


## Prompt 6: Converge + Implement
/speckit-converge (It detected errors in tasks.md)
/speckit-implement