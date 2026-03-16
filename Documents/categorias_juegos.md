# Categorías de Juegos de Mesa - Gamy

se crean con: py manage.py load_categories

## Tabla de Categorías con Traducciones

Esta tabla contiene las categorías predefinidas para clasificar los juegos de mesa en la plataforma Gamy.

| Slug | Español | English | Français | Icono |
|------|---------|---------|----------|-------|
| strategy | Estrategia | Strategy | Stratégie | 🎯 |
| family | Familiar | Family | Familial | 👨‍👩‍👧‍👦 |
| party | Fiesta | Party | Fête | 🎉 |
| cards | Cartas | Cards | Cartes | 🃏 |
| cooperative | Cooperativo | Cooperative | Coopératif | 🤝 |
| dice | Dados | Dice | Dés | 🎲 |
| adventure | Aventura | Adventure | Aventure | 🗺️ |
| fantasy | Fantasía | Fantasy | Fantaisie | 🐉 |
| economy | Económico | Economic | Économique | 💰 |
| abstract | Abstracto | Abstract | Abstrait | 🔷 |
| war | Guerra | War | Guerre | ⚔️ |
| puzzle | Rompecabezas | Puzzle | Puzzle | 🧩 |
| trivia | Trivia | Trivia | Culture Générale | 🧠 |
| horror | Terror | Horror | Horreur | 👻 |
| negotiation | Negociación | Negotiation | Négociation | 🤝💼 |
| deduction | Deducción | Deduction | Déduction | 🕵️ |
| bluffing | Farol | Bluffing | Bluff | 🎭 |
| racing | Carreras | Racing | Course | 🏎️ |
| civilization | Civilización | Civilization | Civilisation | 🏛️ |
| education | Educativo | Educational | Éducatif | 📚 |

## Categorías Adicionales Sugeridas

| Slug | Español | English | Français | Icono |
|------|---------|---------|----------|-------|
| area_control | Control de Área | Area Control | Contrôle de Zone | 🗺️🚩 |
| deck_building | Construcción de Mazos | Deck Building | Construction de Deck | 🃏📦 |
| worker_placement | Colocación de Trabajadores | Worker Placement | Placement d'Ouvriers | 👷 |
| tile_laying | Colocación de Fichas | Tile Laying | Pose de Tuiles | 🧱 |
| roll_and_write | Tira y Escribe | Roll and Write | Lancer et Écrire | 🎲✍️ |
| legacy | Legado | Legacy | Legacy | 📖🔓 |
| storytelling | Narrativo | Storytelling | Narration | 📖 |
| real_time | Tiempo Real | Real Time | Temps Réel | ⏱️ |
| sandbox | Sandbox | Sandbox | Bac à Sable | 🏖️ |
| dungeon_crawler | Exploración de Mazmorras | Dungeon Crawler | Exploration de Donjon | 🏰 |

## Descripción de Categorías Principales

### 🎯 Estrategia (Strategy / Stratégie)
Juegos que requieren planificación a largo plazo, pensamiento táctico y toma de decisiones complejas.

**Ejemplos:** Catan, Carcassonne, Ticket to Ride, Agricola

---

### 👨‍👩‍👧‍👦 Familiar (Family / Familial)
Juegos accesibles para todas las edades, fáciles de aprender y divertidos para toda la familia.

**Ejemplos:** Uno, Dobble, King of Tokyo, Dixit

---

### 🎉 Fiesta (Party / Fête)
Juegos diseñados para grupos grandes, enfocados en diversión social y risas.

**Ejemplos:** Cards Against Humanity, Telestrations, Just One, Codenames

---

### 🃏 Cartas (Cards / Cartes)
Juegos basados principalmente en cartas como componente principal.

**Ejemplos:** Sushi Go!, Love Letter, Exploding Kittens, The Mind

---

### 🤝 Cooperativo (Cooperative / Coopératif)
Juegos donde los jugadores trabajan juntos contra el juego para alcanzar un objetivo común.

**Ejemplos:** Pandemic, Forbidden Island, Hanabi, The Crew

---

### 🎲 Dados (Dice / Dés)
Juegos donde los dados son un componente central del gameplay.

**Ejemplos:** Yahtzee, King of Tokyo, Las Vegas, Perudo

---

### 🗺️ Aventura (Adventure / Aventure)
Juegos con temática de exploración, búsqueda y descubrimiento.

**Ejemplos:** Gloomhaven, Mice and Mystics, Betrayal at House on the Hill

---

### 🐉 Fantasía (Fantasy / Fantaisie)
Juegos ambientados en mundos fantásticos con magia, criaturas míticas y héroes épicos.

**Ejemplos:** Magic: The Gathering, Descent, Mage Knight

---

### 💰 Económico (Economic / Économique)
Juegos centrados en la gestión de recursos, comercio y economía.

**Ejemplos:** Puerto Rico, Power Grid, Brass: Birmingham

---

### 🔷 Abstracto (Abstract / Abstrait)
Juegos sin temática específica, enfocados en mecánicas puras y estrategia.

**Ejemplos:** Azul, Chess, Go, Splendor

---

## Instrucciones para Crear Categorías en Django Admin

1. Acceder al admin: http://localhost:8000/admin/
2. Ir a "Categorías" (Categories)
3. Click en "Agregar Categoría"
4. Completar los campos:
   - **Slug**: Identificador único en minúsculas (ej: "strategy")
   - **Name ES**: Nombre en español
   - **Name EN**: Nombre en inglés
   - **Name FR**: Nombre en francés
   - **Icon**: Emoji correspondiente
   - **Descriptions**: Descripciones opcionales en cada idioma

5. Guardar

## Uso en el Código

```python
# Obtener nombre según idioma del usuario
from django.utils.translation import get_language

category = Category.objects.get(slug='strategy')
language = get_language()  # 'es', 'en', o 'fr'
category_name = category.get_name(language)
# Resultado: "Estrategia", "Strategy", o "Stratégie"
```

## SQL para Inserción Masiva (Opcional)

Si prefieres insertar todas las categorías de una vez, puedes usar este script en el shell de Django:

```python
# py manage.py shell

from catalog.models import Category

categories_data = [
    {'slug': 'strategy', 'name_es': 'Estrategia', 'name_en': 'Strategy', 'name_fr': 'Stratégie', 'icon': '🎯'},
    {'slug': 'family', 'name_es': 'Familiar', 'name_en': 'Family', 'name_fr': 'Familial', 'icon': '👨‍👩‍👧‍👦'},
    {'slug': 'party', 'name_es': 'Fiesta', 'name_en': 'Party', 'name_fr': 'Fête', 'icon': '🎉'},
    {'slug': 'cards', 'name_es': 'Cartas', 'name_en': 'Cards', 'name_fr': 'Cartes', 'icon': '🃏'},
    {'slug': 'cooperative', 'name_es': 'Cooperativo', 'name_en': 'Cooperative', 'name_fr': 'Coopératif', 'icon': '🤝'},
    {'slug': 'dice', 'name_es': 'Dados', 'name_en': 'Dice', 'name_fr': 'Dés', 'icon': '🎲'},
    {'slug': 'adventure', 'name_es': 'Aventura', 'name_en': 'Adventure', 'name_fr': 'Aventure', 'icon': '🗺️'},
    {'slug': 'fantasy', 'name_es': 'Fantasía', 'name_en': 'Fantasy', 'name_fr': 'Fantaisie', 'icon': '🐉'},
    {'slug': 'economy', 'name_es': 'Económico', 'name_en': 'Economic', 'name_fr': 'Économique', 'icon': '💰'},
    {'slug': 'abstract', 'name_es': 'Abstracto', 'name_en': 'Abstract', 'name_fr': 'Abstrait', 'icon': '🔷'},
    {'slug': 'war', 'name_es': 'Guerra', 'name_en': 'War', 'name_fr': 'Guerre', 'icon': '⚔️'},
    {'slug': 'puzzle', 'name_es': 'Rompecabezas', 'name_en': 'Puzzle', 'name_fr': 'Puzzle', 'icon': '🧩'},
    {'slug': 'trivia', 'name_es': 'Trivia', 'name_en': 'Trivia', 'name_fr': 'Culture Générale', 'icon': '🧠'},
    {'slug': 'horror', 'name_es': 'Terror', 'name_en': 'Horror', 'name_fr': 'Horreur', 'icon': '👻'},
    {'slug': 'negotiation', 'name_es': 'Negociación', 'name_en': 'Negotiation', 'name_fr': 'Négociation', 'icon': '🤝💼'},
    {'slug': 'deduction', 'name_es': 'Deducción', 'name_en': 'Deduction', 'name_fr': 'Déduction', 'icon': '🕵️'},
    {'slug': 'bluffing', 'name_es': 'Farol', 'name_en': 'Bluffing', 'name_fr': 'Bluff', 'icon': '🎭'},
    {'slug': 'racing', 'name_es': 'Carreras', 'name_en': 'Racing', 'name_fr': 'Course', 'icon': '🏎️'},
    {'slug': 'civilization', 'name_es': 'Civilización', 'name_en': 'Civilization', 'name_fr': 'Civilisation', 'icon': '🏛️'},
    {'slug': 'education', 'name_es': 'Educativo', 'name_en': 'Educational', 'name_fr': 'Éducatif', 'icon': '📚'},
]

for cat_data in categories_data:
    Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults={
            'name_es': cat_data['name_es'],
            'name_en': cat_data['name_en'],
            'name_fr': cat_data['name_fr'],
            'icon': cat_data['icon']
        }
    )

print(f"✅ {Category.objects.count()} categorías creadas exitosamente!")
```

---

**Última actualización:** Noviembre 2025  
**Archivo:** `Documents/categorias_juegos.md`
