# KAN-56 — Genre taxonomy normalization (enhanced)

## Summary

Normalize all externally sourced genres (Open Library + Google Books, including KAN-54 and KAN-55 fallbacks) to a closed taxonomy for consistent genre distribution analytics.

## Taxonomy

- Fantasía
- Thriller
- Ciencia ficción
- Romance
- Histórica
- Ficción
- No ficción

## Notes

- Unknown external genres become `null`.
- Manual user edits are out of scope in this ticket.
