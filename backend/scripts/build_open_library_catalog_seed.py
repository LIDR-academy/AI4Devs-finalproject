#!/usr/bin/env python3
"""
Build a filtered Open Library catalog seed CSV for catalog_editions import.

Reads OL dumps (authors, works, editions, ratings), filters fiction,
excludes educational/non-fiction, applies decade-based popularity thresholds
using **work-level ratings** (edition key ignored), and writes catalog_seed.csv.

Usage:
  python3 backend/scripts/build_open_library_catalog_seed.py
  python3 backend/scripts/build_open_library_catalog_seed.py --max-lines 100000
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sqlite3
import sys
import time
from pathlib import Path
from typing import Any, Iterable

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
DEFAULT_AUTHORS = Path("/Users/celiamerinovalladolid/Downloads/ol_dump_authors_2026-06-30.txt")
DEFAULT_WORKS = Path("/Users/celiamerinovalladolid/Downloads/ol_dump_works_2026-06-30.txt")
DEFAULT_EDITIONS = Path("/Users/celiamerinovalladolid/Downloads/ol_dump_editions_2026-06-30.txt")
DEFAULT_RATINGS = Path("/Users/celiamerinovalladolid/Downloads/ol_dump_ratings_2026-06-30.txt")
DEFAULT_OUTPUT = BACKEND_DIR / "data" / "catalog_seed.csv"
DEFAULT_CACHE = BACKEND_DIR / "data" / "ol-seed-cache.db"

FICTION_SUBJECT_RE = re.compile(
    r"\b(fiction|novels?|romance|fantasy|science fiction|mystery|thriller|suspense|horror|"
    r"dystopi|adventure stories|short stories|fairy tales|graphic novels|young adult fiction|"
    r"children's fiction|juvenile fiction)\b",
    re.I,
)
EDUCATIONAL_RE = re.compile(
    r"\b(textbooks?|university|college|academic|curriculum|courseware|study guides?|workbooks?|"
    r"manual(es)?\b|handbook|problem books?|lecture notes|exam prep|test prep|SAT\b|GRE\b|GMAT\b|"
    r"MCAT\b|dissertations?|theses\b|reference works?|encyclopedias?|dictionaries\b|atlas\b|"
    r"teacher'?s? (edition|resource)|student edition|higher education)\b",
    re.I,
)
NON_FICTION_SUBJECT_RE = re.compile(
    r"\b(biograph|autobiograph|memoirs?|history\b|politics\b|economics\b|business\b|law\b|"
    r"medicine\b|mathematics\b|physics\b|chemistry\b|biology\b|engineering\b|computer science|"
    r"programming\b|self[- ]help|psychology\b|philosophy\b|cookery|cooking\b|travel guide|"
    r"true crime|journalism\b|essays\b|criticism\b|social sciences?)\b",
    re.I,
)
CLASSIC_TITLE_RE = re.compile(
    r"\b(1984|nineteen eighty[- ]four|don quixote|quijote|little women|mujercitas|"
    r"pride and prejudice|orgullo y prejuicio|cien a[aá]os de soledad|one hundred years of solitude|"
    r"el se[nñ]or de los anillos|the lord of the rings|harry potter|el hobbit|the hobbit|"
    r"to kill a mockingbird|matar a un ruise[nñ]or|frankenstein|dr[aá]cula|moby[- ]dick|"
    r"war and peace|anna karenina|crime and punishment|les mis[eé]rables|great gatsby|"
    r"el gran gatsby|catcher in the rye|animal farm|rebeli[oó]n en la granja|brave new world|"
    r"un mundo feliz|the handmaid'?s tale|pedro p[aá]ramo|rayuela|hopscotch|ficciones|"
    r"lazarillo de tormes|la casa de los esp[ií]ritus|house of the spirits)\b",
    re.I,
)
CLASSIC_WORK_KEYS = {
    "OL1168003W", "OL30831902W", "OL27285397W", "OL45883W", "OL41545825W",
    "OL34021W", "OL16745765W", "OL27448W", "OL45804W", "OL25397W", "OL262758W",
    "OL1167997W", "OL80386W", "OL82563W", "OL1003040W", "OL66554W", "OL1065352W",
    "OL27479W", "OL262792W", "OL1095427W", "OL11697W", "OL53919W", "OL151787W",
    "OL52267W", "OL66533W", "OL66532W", "OL66531W", "OL66530W", "OL151178W",
    "OL262750W",
}
WORK_KEY_RE = re.compile(r"OL\d+W")
EDITION_KEY_RE = re.compile(r"OL\d+M")
AUTHOR_KEY_RE = re.compile(r"OL\d+A")
YEAR_RE = re.compile(r"\b(1[0-9]{3}|20[0-9]{2})\b")

CSV_HEADER = [
    "title", "authors", "isbn_13", "isbn_10", "cover_image_url", "page_count",
    "series_name", "publication_year", "catalog_genre", "data_source", "external_provider_id",
]


def parse_ol_line(line: str) -> tuple[str, str, dict[str, Any]] | None:
    parts = line.rstrip("\n").split("\t", 4)
    if len(parts) < 5:
        return None
    ol_type, key, _revision, _modified, json_text = parts
    try:
        payload = json.loads(json_text)
    except json.JSONDecodeError:
        return None
    return ol_type, key, payload


def stream_dump(path: Path, max_lines: int | None = None) -> Iterable[tuple[str, str, dict[str, Any]]]:
    count = 0
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for raw in handle:
            parsed = parse_ol_line(raw)
            if parsed:
                yield parsed
            count += 1
            if count % 500_000 == 0:
                print(f"  …{count / 1_000_000:.1f}M lines", flush=True)
            if max_lines is not None and count >= max_lines:
                break


def is_classic(work_key: str, title: str) -> bool:
    wid = work_key.replace("/works/", "").strip("/")
    return wid in CLASSIC_WORK_KEYS or bool(CLASSIC_TITLE_RE.search(title))


def popularity_from_work_ratings(
    rating_count: int,
    avg_rating: float,
    classic: bool,
) -> int:
    """
    Map work-level OL ratings (1–5 stars + count) to a 1–10 popularity score.

    Ratings for any edition of the work are pre-aggregated by work_key.
    """
    if rating_count <= 0:
        return 9 if classic else 1

    # Bayesian shrink toward a mild prior so a single 5★ does not dominate.
    prior_count = 5.0
    prior_mean = 3.5
    bayes = (rating_count * avg_rating + prior_count * prior_mean) / (
        rating_count + prior_count
    )

    # Volume: 1 → ~2.5, 10 → ~4.5, 100 → ~6.5, 1000+ → ~8
    volume = min(7.0, math.log10(rating_count + 1) * 3.2)
    quality = ((bayes - 1.0) / 4.0) * 3.0  # 0–3
    score = 1.0 + volume + quality

    if classic:
        score = max(score, 9.0)

    return max(1, min(10, round(score)))


def min_popularity_for_year(year: int, classic: bool) -> int:
    if classic:
        return 1
    if year >= 2020:
        return 5
    if year >= 2010:
        return 6
    if year >= 2000:
        return 7
    if year >= 1990:
        return 8
    if year >= 1980:
        return 9
    if year >= 1900:
        return 10
    return 11


def passes_popularity_gate(popularity: int, year: int | None, classic: bool) -> bool:
    if classic:
        return True
    if year is None:
        return popularity >= 8
    return popularity >= min_popularity_for_year(year, classic)


def is_educational(subjects: list[str], title: str) -> bool:
    return bool(EDUCATIONAL_RE.search(f"{title} {' '.join(subjects)}"))


def is_fiction(subjects: list[str], title: str, work_key: str) -> bool:
    if is_classic(work_key, title):
        return True
    if not subjects:
        return False
    if is_educational(subjects, title):
        return False
    fiction_hits = sum(1 for s in subjects if FICTION_SUBJECT_RE.search(s))
    if fiction_hits == 0:
        return False
    non_fiction_hits = sum(1 for s in subjects if NON_FICTION_SUBJECT_RE.search(s))
    return non_fiction_hits <= fiction_hits + 1


def pick_genre(subjects: list[str]) -> str | None:
    for subject in subjects:
        if FICTION_SUBJECT_RE.search(subject):
            return subject
    return subjects[0] if subjects else None


def extract_work_key(raw: str | None) -> str | None:
    if not raw:
        return None
    match = WORK_KEY_RE.search(raw)
    return match.group(0) if match else None


def extract_edition_key(raw: str | None) -> str | None:
    if not raw:
        return None
    match = EDITION_KEY_RE.search(raw)
    return match.group(0) if match else None


def extract_author_keys(authors: list[dict[str, Any]] | None) -> list[str]:
    keys: list[str] = []
    if not authors:
        return keys
    for entry in authors:
        raw = None
        if isinstance(entry, dict):
            author = entry.get("author")
            if isinstance(author, dict):
                raw = author.get("key")
            raw = raw or entry.get("key")
        if isinstance(raw, str):
            match = AUTHOR_KEY_RE.search(raw)
            if match:
                keys.append(match.group(0))
    return keys


def normalize_isbn(value: str | None) -> str | None:
    if not value:
        return None
    digits = re.sub(r"[^0-9Xx]", "", value).upper()
    if len(digits) in (10, 13):
        return digits
    return None


def pick_isbn(values: list[str] | None, length: int) -> str | None:
    if not values:
        return None
    for candidate in values:
        normalized = normalize_isbn(candidate)
        if normalized and len(normalized) == length:
            return normalized
    return None


def parse_year(publish_date: str | None) -> int | None:
    if not publish_date:
        return None
    match = YEAR_RE.search(publish_date)
    return int(match.group(1)) if match else None


def cover_url(cover_id: int | None) -> str | None:
    if cover_id is None or cover_id <= 0:
        return None
    return f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"


def edition_quality(
    has_isbn13: bool,
    has_isbn10: bool,
    pages: int | None,
    has_cover: bool,
    year: int | None,
) -> int:
    score = 0
    if has_isbn13:
        score += 20
    if has_isbn10:
        score += 10
    if pages and pages > 0:
        score += 5
    if has_cover:
        score += 8
    if year is not None:
        score += 2
    return score


def init_db(cache_path: Path) -> sqlite3.Connection:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(cache_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.executescript(
        """
        DROP TABLE IF EXISTS authors;
        DROP TABLE IF EXISTS works;
        DROP TABLE IF EXISTS work_ratings;
        DROP TABLE IF EXISTS best_editions;

        CREATE TABLE authors (
          author_key TEXT PRIMARY KEY,
          name TEXT NOT NULL
        );
        CREATE TABLE work_ratings (
          work_key TEXT PRIMARY KEY,
          rating_count INTEGER NOT NULL,
          rating_sum REAL NOT NULL,
          avg_rating REAL NOT NULL
        );
        CREATE TABLE works (
          work_key TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          author_keys TEXT NOT NULL,
          popularity INTEGER NOT NULL,
          is_classic INTEGER NOT NULL,
          catalog_genre TEXT,
          work_cover_id INTEGER,
          rating_count INTEGER NOT NULL DEFAULT 0,
          avg_rating REAL
        );
        CREATE TABLE best_editions (
          work_key TEXT PRIMARY KEY,
          edition_key TEXT NOT NULL,
          title TEXT NOT NULL,
          isbn_13 TEXT,
          isbn_10 TEXT,
          cover_image_url TEXT,
          page_count INTEGER,
          publication_year INTEGER,
          quality_score INTEGER NOT NULL
        );
        """
    )
    return conn


def load_work_ratings(conn: sqlite3.Connection, path: Path, max_lines: int | None) -> None:
    """
    Aggregate ratings by work_key only.

    Dump columns: Work Key, Edition Key (optional / \\N), Rating (1–5), Date.
    Edition key is intentionally ignored so popularity is work-level.
    """
    print(f"[1/5] Aggregating work ratings from {path}")
    aggregates: dict[str, list[float]] = {}
    count = 0
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for raw in handle:
            count += 1
            if max_lines is not None and count > max_lines:
                break
            parts = raw.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            work_raw, _edition_raw, rating_raw = parts[0], parts[1], parts[2]
            work_key = extract_work_key(work_raw)
            if not work_key:
                continue
            try:
                rating = float(rating_raw)
            except ValueError:
                continue
            if rating < 1 or rating > 5:
                continue
            bucket = aggregates.get(work_key)
            if bucket is None:
                aggregates[work_key] = [1.0, rating]
            else:
                bucket[0] += 1.0
                bucket[1] += rating
            if count % 200_000 == 0:
                print(f"  …{count / 1_000_000:.1f}M rating rows", flush=True)

    rows = [
        (work_key, int(total), total_sum, total_sum / total)
        for work_key, (total, total_sum) in aggregates.items()
    ]
    conn.executemany(
        "INSERT OR REPLACE INTO work_ratings (work_key, rating_count, rating_sum, avg_rating) VALUES (?, ?, ?, ?)",
        rows,
    )
    conn.commit()
    print(
        f"  → {count:,} rating rows → {len(rows):,} works with ratings "
        f"(edition keys ignored)"
    )


def load_authors(conn: sqlite3.Connection, path: Path, max_lines: int | None) -> None:
    print(f"[2/5] Loading authors from {path}")
    batch: list[tuple[str, str]] = []
    for ol_type, key, payload in stream_dump(path, max_lines):
        if "/author" not in ol_type:
            continue
        name = payload.get("name")
        if not isinstance(name, str) or not name.strip():
            continue
        author_key = AUTHOR_KEY_RE.search(key)
        if not author_key:
            continue
        batch.append((author_key.group(0), name.strip()))
        if len(batch) >= 5000:
            conn.executemany("INSERT OR REPLACE INTO authors VALUES (?, ?)", batch)
            conn.commit()
            batch.clear()
    if batch:
        conn.executemany("INSERT OR REPLACE INTO authors VALUES (?, ?)", batch)
        conn.commit()
    total = conn.execute("SELECT COUNT(*) FROM authors").fetchone()[0]
    print(f"  → {total:,} authors indexed")


def load_works(conn: sqlite3.Connection, path: Path, max_lines: int | None) -> None:
    print(f"[3/5] Filtering fiction works from {path}")
    ratings = {
        row[0]: (row[1], row[2])
        for row in conn.execute(
            "SELECT work_key, rating_count, avg_rating FROM work_ratings"
        )
    }
    batch: list[tuple[Any, ...]] = []
    kept = 0
    skipped_unrated = 0
    for ol_type, key, payload in stream_dump(path, max_lines):
        if "/work" not in ol_type:
            continue
        work_key = extract_work_key(key)
        title = payload.get("title")
        if not work_key or not isinstance(title, str) or not title.strip():
            continue
        subjects = payload.get("subjects")
        subject_list = subjects if isinstance(subjects, list) else []
        subject_strings = [s for s in subject_list if isinstance(s, str)]
        if not is_fiction(subject_strings, title, work_key):
            continue

        classic = is_classic(work_key, title)
        rating_count, avg_rating = ratings.get(work_key, (0, 0.0))
        # Unrated obscure works are dropped; classics always kept.
        if rating_count <= 0 and not classic:
            skipped_unrated += 1
            continue

        popularity = popularity_from_work_ratings(
            int(rating_count), float(avg_rating), classic
        )
        author_keys = extract_author_keys(
            payload.get("authors") if isinstance(payload.get("authors"), list) else None
        )
        covers_raw = payload.get("covers")
        covers = (
            [c for c in covers_raw if isinstance(c, int) and c > 0]
            if isinstance(covers_raw, list)
            else []
        )
        genre = pick_genre(subject_strings)
        cover_id = covers[0] if covers else None
        batch.append(
            (
                work_key,
                title.strip(),
                json.dumps(author_keys),
                popularity,
                1 if classic else 0,
                genre,
                cover_id,
                int(rating_count),
                float(avg_rating) if rating_count else None,
            )
        )
        kept += 1
        if len(batch) >= 2000:
            conn.executemany(
                """
                INSERT OR REPLACE INTO works
                (work_key, title, author_keys, popularity, is_classic, catalog_genre,
                 work_cover_id, rating_count, avg_rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                batch,
            )
            conn.commit()
            batch.clear()
    if batch:
        conn.executemany(
            """
            INSERT OR REPLACE INTO works
            (work_key, title, author_keys, popularity, is_classic, catalog_genre,
             work_cover_id, rating_count, avg_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            batch,
        )
        conn.commit()
    print(
        f"  → {kept:,} fiction works kept "
        f"(skipped {skipped_unrated:,} unrated non-classics)"
    )


def pick_editions(conn: sqlite3.Connection, path: Path, max_lines: int | None) -> None:
    print(f"[4/5] Selecting best ISBN editions from {path}")
    works = {
        row[0]: row[1:]
        for row in conn.execute(
            """
            SELECT work_key, title, author_keys, popularity, is_classic,
                   catalog_genre, work_cover_id
            FROM works
            """
        )
    }
    scanned = 0
    upserts = 0
    for ol_type, key, payload in stream_dump(path, max_lines):
        if "/edition" not in ol_type:
            continue
        scanned += 1
        works_raw = payload.get("works")
        work_key = None
        if isinstance(works_raw, list) and works_raw:
            first = works_raw[0]
            if isinstance(first, dict):
                work_key = extract_work_key(first.get("key"))
        if not work_key or work_key not in works:
            continue
        title, _author_keys, popularity, classic_flag, _genre, work_cover_id = works[
            work_key
        ]
        isbn13 = pick_isbn(
            payload.get("isbn_13") if isinstance(payload.get("isbn_13"), list) else None,
            13,
        )
        isbn10 = pick_isbn(
            payload.get("isbn_10") if isinstance(payload.get("isbn_10"), list) else None,
            10,
        )
        if not isbn13 and not isbn10:
            continue
        pub_year = parse_year(
            payload.get("publish_date")
            if isinstance(payload.get("publish_date"), str)
            else None
        )
        classic = bool(classic_flag)
        if not passes_popularity_gate(int(popularity), pub_year, classic):
            continue
        edition_key = extract_edition_key(key)
        if not edition_key:
            continue
        pages_raw = payload.get("number_of_pages")
        pages = int(pages_raw) if isinstance(pages_raw, int) else None
        edition_covers = payload.get("covers")
        cover_id = None
        if isinstance(edition_covers, list):
            positives = [c for c in edition_covers if isinstance(c, int) and c > 0]
            cover_id = positives[0] if positives else None
        if cover_id is None and isinstance(work_cover_id, int):
            cover_id = work_cover_id
        cover = cover_url(cover_id)
        edition_title = payload.get("title")
        final_title = (
            edition_title.strip()
            if isinstance(edition_title, str) and edition_title.strip()
            else title
        )
        quality = edition_quality(
            bool(isbn13), bool(isbn10), pages, bool(cover), pub_year
        )
        existing = conn.execute(
            "SELECT quality_score FROM best_editions WHERE work_key = ?",
            (work_key,),
        ).fetchone()
        if existing and existing[0] >= quality:
            continue
        conn.execute(
            """
            INSERT OR REPLACE INTO best_editions
            (work_key, edition_key, title, isbn_13, isbn_10, cover_image_url,
             page_count, publication_year, quality_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                work_key,
                edition_key,
                final_title,
                isbn13,
                isbn10,
                cover,
                pages,
                pub_year,
                quality,
            ),
        )
        upserts += 1
        if upserts % 5000 == 0:
            conn.commit()
    conn.commit()
    total = conn.execute("SELECT COUNT(*) FROM best_editions").fetchone()[0]
    print(f"  → scanned {scanned:,} editions; {total:,} works exported")


def resolve_authors(conn: sqlite3.Connection, author_keys_json: str) -> str:
    keys = json.loads(author_keys_json)
    names: list[str] = []
    for key in keys[:5]:
        row = conn.execute(
            "SELECT name FROM authors WHERE author_key = ?", (key,)
        ).fetchone()
        if row:
            names.append(row[0])
    return ", ".join(names) if names else "Unknown"


def export_csv(conn: sqlite3.Connection, output_path: Path) -> None:
    print(f"[5/5] Exporting CSV to {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows = conn.execute(
        """
        SELECT b.title, w.author_keys, b.isbn_13, b.isbn_10, b.cover_image_url,
               b.page_count, b.publication_year, w.catalog_genre, b.edition_key
        FROM best_editions b
        INNER JOIN works w ON w.work_key = b.work_key
        ORDER BY b.publication_year DESC NULLS LAST, b.title
        """
    ).fetchall()
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(CSV_HEADER)
        for row in rows:
            (
                title,
                author_keys_json,
                isbn13,
                isbn10,
                cover,
                pages,
                year,
                genre,
                edition_key,
            ) = row
            writer.writerow(
                [
                    title,
                    resolve_authors(conn, author_keys_json),
                    isbn13 or "",
                    isbn10 or "",
                    cover or "",
                    pages if pages is not None else "",
                    "",
                    year if year is not None else "",
                    genre or "",
                    "open_library",
                    edition_key,
                ]
            )
    print(f"  → {len(rows):,} rows written")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build filtered Open Library catalog seed CSV"
    )
    parser.add_argument("--authors", type=Path, default=DEFAULT_AUTHORS)
    parser.add_argument("--works", type=Path, default=DEFAULT_WORKS)
    parser.add_argument("--editions", type=Path, default=DEFAULT_EDITIONS)
    parser.add_argument("--ratings", type=Path, default=DEFAULT_RATINGS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE)
    parser.add_argument(
        "--max-lines", type=int, default=None, help="Limit lines per dump (smoke test)"
    )
    args = parser.parse_args()

    for label, path in [
        ("ratings", args.ratings),
        ("authors", args.authors),
        ("works", args.works),
        ("editions", args.editions),
    ]:
        if not path.exists():
            print(f"ERROR: {label} dump not found: {path}", file=sys.stderr)
            return 1

    started = time.time()
    print("Open Library catalog seed builder (work-level ratings)")
    print(f"  ratings: {args.ratings}")
    print(f"  cache:   {args.cache}")
    print(f"  output:  {args.output}")

    conn = init_db(args.cache)
    try:
        load_work_ratings(conn, args.ratings, args.max_lines)
        load_authors(conn, args.authors, args.max_lines)
        load_works(conn, args.works, args.max_lines)
        # Editions are used only for ISBN/cover/pages — not for popularity.
        pick_editions(conn, args.editions, args.max_lines)
        export_csv(conn, args.output)
    finally:
        conn.close()

    mins = (time.time() - started) / 60
    print(f"Done in {mins:.1f} minutes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
