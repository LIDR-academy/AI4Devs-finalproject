# Matriz de Autorización - VetConnect

## Resumen del Sistema

Sistema de autorización implementado con **Pundit** que controla qué acciones puede realizar cada rol sobre cada recurso.

### Roles del Sistema

- **Owner**: Dueño de mascota
- **Veterinarian**: Veterinario profesional  
- **Admin**: Administrador de clínica

---

## Matriz de Permisos

### Pets (Mascotas)

| Acción | Owner | Veterinarian | Admin |
|--------|-------|--------------|-------|
| Listar | Solo propias | Todas | Todas |
| Ver | Solo propias | Todas | Todas |
| Crear | ✅ | ❌ | ❌ |
| Editar | Solo propias | ❌ | ❌ |
| Eliminar | Solo propias | ❌ | ❌ |

### Appointments (Citas)

| Acción | Owner | Veterinarian | Admin |
|--------|-------|--------------|-------|
| Listar | Solo propias | Todas | Todas |
| Ver | Solo propias | Todas | Todas |
| Crear | ✅ | ✅ | ✅ |
| Editar | Solo propias* | Todas* | Todas* |
| Cancelar | Solo propias* | ❌ | Todas* |
| Completar | ❌ | ✅ | ✅ |

\* No se pueden modificar citas completadas o pasadas

### Medical Records (Registros Médicos)

| Acción | Owner | Veterinarian | Admin |
|--------|-------|--------------|-------|
| Listar | Solo propios | Todos | Todos |
| Ver | Solo propios | Todos | Todos |
| Crear | ❌ | ✅ | ✅ |
| Editar | ❌ | ✅ | ✅ |
| Eliminar | ❌ | ❌ | ❌ |

**⚠️ Regla crítica**: Los registros médicos NUNCA se eliminan (auditoría médica)

### Documents (Documentos)

| Acción | Owner | Veterinarian | Admin |
|--------|-------|--------------|-------|
| Listar | Solo propios | Todos | Todos |
| Ver | Solo propios | Todos | Todos |
| Subir | Para sus mascotas | ✅ | ✅ |
| Editar | Solo propios† | Solo propios† | Todos |
| Eliminar | Solo propios† | Solo propios† | Todos |

† Solo documentos que el usuario subió

### Users (Usuarios)

| Acción | Owner | Veterinarian | Admin |
|--------|-------|--------------|-------|
| Listar | Limitado‡ | Limitado‡ | Todos |
| Ver perfil | Propio + Vets | Propio + Owners | Todos |
| Crear | ❌ | ❌ | ✅ |
| Editar | Solo propio | Solo propio | Todos |
| Eliminar | ❌ | ❌ | Todos§ |
| Cambiar rol | ❌ | ❌ | ✅§ |
| Gestionar clínica | ❌ | ❌ | ✅ |
| Ver reportes | ❌ | ❌ | ✅ |

‡ Solo usuarios con quienes han interactuado  
§ Admin no puede eliminarse ni cambiar su propio rol

---

## Uso en Código

### Controladores

```ruby
# Filtrar colecciones
def index
  @pets = policy_scope(Pet)
end

# Verificar permisos
def show
  @pet = Pet.find(params[:id])
  authorize @pet
end

# Acciones personalizadas
def complete
  @appointment = Appointment.find(params[:id])
  authorize @appointment, :complete?
  # ...
end
```

### Vistas

```erb
<% if policy(@pet).update? %>
  <%= link_to 'Editar', edit_pet_path(@pet) %>
<% end %>

<% if policy(@appointment).complete? %>
  <%= link_to 'Completar', complete_appointment_path(@appointment) %>
<% end %>
```

---

## Testing

```bash
# Ejecutar tests de políticas
bundle exec rspec spec/policies/

# Test específico
bundle exec rspec spec/policies/pet_policy_spec.rb
```

---

## Reglas de Negocio Críticas

1. **Registros médicos inmutables**: Nadie puede eliminarlos (auditoría obligatoria)
2. **Citas pasadas bloqueadas**: No se pueden modificar citas completadas
3. **Propiedad de documentos**: Solo el uploader puede modificar (excepto admins)
4. **Autoprotección admins**: No pueden eliminarse o cambiar su propio rol
5. **Privacy scopes**: Usuarios solo ven perfiles con quienes han interactuado

---

## Setup Rápido

```bash
# 1. Instalar dependencias
bundle install

# 2. Configurar DB
rails db:migrate
rails db:seed

# 3. Testing
bundle exec rspec spec/policies/
```

### Cuentas de prueba (password: `password123`)

- **Admin**: admin@vetconnect.com
- **Vet**: carlos@vetconnect.com
- **Owner**: maria@example.com (tiene mascotas Max y Luna)

---

## Estructura de Archivos

```
app/
├── policies/
│   ├── application_policy.rb      # Política base
│   ├── pet_policy.rb
│   ├── appointment_policy.rb
│   ├── medical_record_policy.rb
│   ├── document_policy.rb
│   └── user_policy.rb
│
└── controllers/
    ├── application_controller.rb  # Incluye Pundit
    ├── pets_controller.rb
    ├── appointments_controller.rb
    ├── medical_records_controller.rb
    ├── documents_controller.rb
    └── users_controller.rb
```

---

**Versión**: 1.0  
**Última actualización**: 2026-01-11
