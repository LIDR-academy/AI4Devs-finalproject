from django.core.management.base import BaseCommand
from catalog.models import Category


class Command(BaseCommand):
    help = 'Carga las categorías iniciales de juegos en tres idiomas'

    def handle(self, *args, **kwargs):
        categories_data = [
            {
                'slug': 'estrategia',
                'icon': '🧠',
                'name_es': 'Estrategia',
                'name_en': 'Strategy',
                'name_fr': 'Stratégie',
                'description_es': 'Juegos que requieren planificación, toma de decisiones y pensamiento crítico',
                'description_en': 'Games requiring planning, decision-making, and critical thinking',
                'description_fr': 'Jeux nécessitant planification, prise de décision et pensée critique'
            },
            {
                'slug': 'familiar',
                'icon': '👨‍👩‍👧‍👦',
                'name_es': 'Familiar',
                'name_en': 'Family',
                'name_fr': 'Familial',
                'description_es': 'Juegos aptos para todas las edades, perfectos para jugar en familia',
                'description_en': 'Games suitable for all ages, perfect for family play',
                'description_fr': 'Jeux adaptés à tous les âges, parfaits pour jouer en famille'
            },
            {
                'slug': 'cartas',
                'icon': '🎴',
                'name_es': 'Juegos de Cartas',
                'name_en': 'Card Games',
                'name_fr': 'Jeux de Cartes',
                'description_es': 'Juegos basados principalmente en el uso de cartas',
                'description_en': 'Games primarily based on card use',
                'description_fr': 'Jeux principalement basés sur l\'utilisation de cartes'
            },
            {
                'slug': 'dados',
                'icon': '🎲',
                'name_es': 'Juegos de Dados',
                'name_en': 'Dice Games',
                'name_fr': 'Jeux de Dés',
                'description_es': 'Juegos donde los dados son el elemento principal',
                'description_en': 'Games where dice are the main element',
                'description_fr': 'Jeux où les dés sont l\'élément principal'
            },
            {
                'slug': 'cooperativos',
                'icon': '🤝',
                'name_es': 'Cooperativos',
                'name_en': 'Cooperative',
                'name_fr': 'Coopératifs',
                'description_es': 'Juegos donde los jugadores trabajan juntos hacia un objetivo común',
                'description_en': 'Games where players work together toward a common goal',
                'description_fr': 'Jeux où les joueurs travaillent ensemble vers un objectif commun'
            },
            {
                'slug': 'party',
                'icon': '🎉',
                'name_es': 'Party Games',
                'name_en': 'Party Games',
                'name_fr': 'Jeux de Société',
                'description_es': 'Juegos diseñados para grupos grandes y ambiente festivo',
                'description_en': 'Games designed for large groups and festive atmosphere',
                'description_fr': 'Jeux conçus pour les grands groupes et l\'ambiance festive'
            },
            {
                'slug': 'abstract',
                'icon': '⚫',
                'name_es': 'Abstractos',
                'name_en': 'Abstract',
                'name_fr': 'Abstraits',
                'description_es': 'Juegos sin temática específica, enfocados en mecánicas puras',
                'description_en': 'Games without specific theme, focused on pure mechanics',
                'description_fr': 'Jeux sans thème spécifique, axés sur la mécanique pure'
            },
            {
                'slug': 'tematicos',
                'icon': '🗺️',
                'name_es': 'Temáticos',
                'name_en': 'Thematic',
                'name_fr': 'Thématiques',
                'description_es': 'Juegos con narrativas inmersivas y ambientación rica',
                'description_en': 'Games with immersive narratives and rich setting',
                'description_fr': 'Jeux avec des récits immersifs et un cadre riche'
            },
            {
                'slug': 'construccion-mazos',
                'icon': '🃏',
                'name_es': 'Construcción de Mazos',
                'name_en': 'Deck Building',
                'name_fr': 'Construction de Deck',
                'description_es': 'Juegos donde construyes y mejoras tu mazo durante la partida',
                'description_en': 'Games where you build and improve your deck during play',
                'description_fr': 'Jeux où vous construisez et améliorez votre deck pendant le jeu'
            },
            {
                'slug': 'gestion-recursos',
                'icon': '💰',
                'name_es': 'Gestión de Recursos',
                'name_en': 'Resource Management',
                'name_fr': 'Gestion des Ressources',
                'description_es': 'Juegos centrados en administrar recursos limitados eficientemente',
                'description_en': 'Games focused on efficiently managing limited resources',
                'description_fr': 'Jeux axés sur la gestion efficace de ressources limitées'
            },
            {
                'slug': 'rol',
                'icon': '🐉',
                'name_es': 'Juegos de Rol',
                'name_en': 'Role-Playing Games',
                'name_fr': 'Jeux de Rôle',
                'description_es': 'Juegos donde interpretas un personaje en una historia',
                'description_en': 'Games where you play a character in a story',
                'description_fr': 'Jeux où vous jouez un personnage dans une histoire'
            },
            {
                'slug': 'miniaturas',
                'icon': '⚔️',
                'name_es': 'Miniaturas',
                'name_en': 'Miniatures',
                'name_fr': 'Figurines',
                'description_es': 'Juegos que usan miniaturas para representar personajes o unidades',
                'description_en': 'Games using miniatures to represent characters or units',
                'description_fr': 'Jeux utilisant des figurines pour représenter des personnages ou unités'
            },
            {
                'slug': 'guerra',
                'icon': '🪖',
                'name_es': 'Guerra',
                'name_en': 'Wargames',
                'name_fr': 'Jeux de Guerre',
                'description_es': 'Simulaciones de conflictos militares o batallas',
                'description_en': 'Simulations of military conflicts or battles',
                'description_fr': 'Simulations de conflits militaires ou batailles'
            },
            {
                'slug': 'educativos',
                'icon': '📚',
                'name_es': 'Educativos',
                'name_en': 'Educational',
                'name_fr': 'Éducatifs',
                'description_es': 'Juegos diseñados para enseñar conceptos o habilidades',
                'description_en': 'Games designed to teach concepts or skills',
                'description_fr': 'Jeux conçus pour enseigner des concepts ou compétences'
            },
            {
                'slug': 'palabras',
                'icon': '🔤',
                'name_es': 'Juegos de Palabras',
                'name_en': 'Word Games',
                'name_fr': 'Jeux de Mots',
                'description_es': 'Juegos basados en formar palabras o vocabulario',
                'description_en': 'Games based on word formation or vocabulary',
                'description_fr': 'Jeux basés sur la formation de mots ou le vocabulaire'
            },
            {
                'slug': 'deduccion',
                'icon': '🔍',
                'name_es': 'Deducción',
                'name_en': 'Deduction',
                'name_fr': 'Déduction',
                'description_es': 'Juegos donde debes deducir información oculta',
                'description_en': 'Games where you must deduce hidden information',
                'description_fr': 'Jeux où vous devez déduire des informations cachées'
            },
            {
                'slug': 'bluffing',
                'icon': '🎭',
                'name_es': 'Bluffing',
                'name_en': 'Bluffing',
                'name_fr': 'Bluff',
                'description_es': 'Juegos donde engañar o farolear es parte clave',
                'description_en': 'Games where deceiving or bluffing is a key part',
                'description_fr': 'Jeux où tromper ou bluffer est une partie clé'
            },
            {
                'slug': 'tiempo-real',
                'icon': '⏱️',
                'name_es': 'Tiempo Real',
                'name_en': 'Real Time',
                'name_fr': 'Temps Réel',
                'description_es': 'Juegos donde todos juegan simultáneamente sin turnos',
                'description_en': 'Games where everyone plays simultaneously without turns',
                'description_fr': 'Jeux où tout le monde joue simultanément sans tours'
            },
            {
                'slug': 'legacy',
                'icon': '📖',
                'name_es': 'Legacy',
                'name_en': 'Legacy',
                'name_fr': 'Legacy',
                'description_es': 'Juegos con campaña persistente que evoluciona entre partidas',
                'description_en': 'Games with persistent campaign that evolves between sessions',
                'description_fr': 'Jeux avec campagne persistante qui évolue entre les sessions'
            },
            {
                'slug': 'puzzles',
                'icon': '🧩',
                'name_es': 'Puzzles',
                'name_en': 'Puzzles',
                'name_fr': 'Puzzles',
                'description_es': 'Juegos basados en resolver acertijos o problemas lógicos',
                'description_en': 'Games based on solving riddles or logical problems',
                'description_fr': 'Jeux basés sur la résolution d\'énigmes ou problèmes logiques'
            }
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'icon': cat_data['icon'],
                    'name_es': cat_data['name_es'],
                    'name_en': cat_data['name_en'],
                    'name_fr': cat_data['name_fr'],
                    'description_es': cat_data['description_es'],
                    'description_en': cat_data['description_en'],
                    'description_fr': cat_data['description_fr']
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Creada: {category.slug} - {category.name_es}')
                )
            else:
                # Verificar si necesita actualización
                needs_update = False
                for field, value in cat_data.items():
                    if field != 'slug' and getattr(category, field) != value:
                        needs_update = True
                        setattr(category, field, value)
                
                if needs_update:
                    category.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Actualizada: {category.slug} - {category.name_es}')
                    )
                else:
                    skipped_count += 1
                    self.stdout.write(
                        self.style.HTTP_INFO(f'⏭️  Ya existe: {category.slug} - {category.name_es}')
                    )

        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS(f'📊 RESUMEN:'))
        self.stdout.write(self.style.SUCCESS(f'   Creadas: {created_count}'))
        self.stdout.write(self.style.SUCCESS(f'   Actualizadas: {updated_count}'))
        self.stdout.write(self.style.SUCCESS(f'   Sin cambios: {skipped_count}'))
        self.stdout.write(self.style.SUCCESS(f'   Total procesadas: {len(categories_data)}'))
        self.stdout.write(self.style.SUCCESS('='*60))
