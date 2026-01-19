# Quick Start

```bash
# 1. Cargar entorno Ruby (si acabas de instalarlo)
source ~/.bashrc

# 2. Instalar dependencias
cd vetconnect
bundle install

# 3. Configurar DB
cp env.example.txt .env
bundle exec rails db:create db:migrate
bundle exec rails active_storage:install db:migrate

# 4. Seeds (opcional)
bundle exec rails db:seed

# 5. Ejecutar tests
bundle exec rspec spec/models/pet_spec.rb

# 6. Iniciar
bundle exec rails server
```

Login: maria@example.com / password123
