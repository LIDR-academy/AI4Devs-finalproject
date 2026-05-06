# Two-Factor Authentication (2FA) - Guía de Implementación

Roadmap para añadir 2FA a VetConnect en futuras iteraciones.

## Overview

2FA añade una capa extra de seguridad requiriendo:
1. Algo que conoces (password)
2. Algo que tienes (teléfono/authenticator app)

**Prioridad**: Alta para admins y veterinarios, opcional para owners.

## Implementación

### 1. Dependencias

```ruby
# Gemfile
gem 'devise-two-factor', '~> 5.0'
gem 'rqrcode', '~> 2.2'  # Para QR codes
```

### 2. Migración

```ruby
class AddTwoFactorToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :otp_secret, :string
    add_column :users, :otp_required_for_login, :boolean, default: false
    add_column :users, :otp_backup_codes, :text, array: true, default: []
    
    add_index :users, :otp_secret, unique: true
  end
end
```

### 3. Modelo User

```ruby
class User < ApplicationRecord
  devise :two_factor_authenticatable,
         :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :trackable,
         otp_secret_encryption_key: ENV['OTP_SECRET_ENCRYPTION_KEY']

  def enable_two_factor!
    self.otp_secret = User.generate_otp_secret
    self.otp_required_for_login = true
    generate_backup_codes
    save!
  end
  
  def disable_two_factor!
    update!(
      otp_required_for_login: false,
      otp_secret: nil,
      otp_backup_codes: []
    )
  end
  
  def generate_backup_codes
    codes = Array.new(10) { SecureRandom.hex(4) }
    update!(otp_backup_codes: codes)
    codes
  end
end
```

### 4. Controlador 2FA

```ruby
# app/controllers/users/two_factor_controller.rb
class Users::TwoFactorController < ApplicationController
  before_action :authenticate_user!
  
  def enable
    current_user.enable_two_factor!
    @qr_code = generate_qr_code
    @backup_codes = current_user.otp_backup_codes
  end
  
  def verify
    if current_user.validate_and_consume_otp!(params[:otp_code])
      flash[:success] = '2FA activado correctamente'
      redirect_to profile_path
    else
      flash[:error] = 'Código inválido'
      render :enable
    end
  end
  
  private
  
  def generate_qr_code
    otp_uri = current_user.otp_provisioning_uri(
      "VetConnect:#{current_user.email}", 
      issuer: 'VetConnect'
    )
    RQRCode::QRCode.new(otp_uri).as_svg
  end
end
```

### 5. Verificación en Login

```ruby
# app/controllers/users/sessions_controller.rb
class Users::SessionsController < Devise::SessionsController
  def create
    self.resource = warden.authenticate!(auth_options)
    
    if resource.otp_required_for_login?
      session[:otp_user_id] = resource.id
      render :two_factor_auth
    else
      sign_in(resource)
      redirect_to after_sign_in_path_for(resource)
    end
  end
  
  def verify_otp
    user = User.find(session[:otp_user_id])
    
    if user.validate_and_consume_otp!(params[:otp_code]) || 
       user.otp_backup_codes.include?(params[:otp_code])
      session.delete(:otp_user_id)
      sign_in(user)
      redirect_to after_sign_in_path_for(user)
    else
      flash.now[:error] = 'Código inválido'
      render :two_factor_auth
    end
  end
end
```

### 6. Rutas

```ruby
# config/routes.rb
resource :two_factor, only: [:show], controller: 'users/two_factor' do
  post :enable
  post :verify
  delete :disable
end

post '/verify_otp', to: 'users/sessions#verify_otp'
```

## Vistas Clave

### Setup (app/views/users/two_factor/enable.html.erb)

```erb
<h2>Activar 2FA</h2>

<div class="step">
  <h3>1. Escanea el QR Code</h3>
  <%= @qr_code.html_safe %>
  <p>Usa Google Authenticator, Authy, o similar</p>
</div>

<div class="step">
  <h3>2. Guarda los códigos de respaldo</h3>
  <% @backup_codes.each do |code| %>
    <code><%= code %></code>
  <% end %>
</div>

<div class="step">
  <h3>3. Verifica</h3>
  <%= form_with url: verify_two_factor_path do |f| %>
    <%= f.text_field :otp_code, placeholder: '123456' %>
    <%= f.submit 'Verificar' %>
  <% end %>
</div>
```

### Login Verification (app/views/users/sessions/two_factor_auth.html.erb)

```erb
<h2>Verificación 2FA</h2>

<%= form_with url: verify_otp_path do |f| %>
  <%= f.text_field :otp_code, placeholder: 'Código de 6 dígitos' %>
  <%= f.submit 'Verificar' %>
<% end %>

<p>¿Perdiste tu dispositivo? Usa un código de respaldo.</p>
```

## Seguridad

### Consideraciones

1. **Encriptación**: OTP secrets deben estar encriptados
   ```bash
   # Generar clave
   rails secret
   # Añadir a .env
   OTP_SECRET_ENCRYPTION_KEY=tu_clave_generada
   ```

2. **Rate Limiting**: Limitar intentos de verificación OTP
   ```ruby
   # config/initializers/rack_attack.rb
   throttle('otp_verify/ip', limit: 5, period: 5.minutes) do |req|
     req.ip if req.path == '/verify_otp' && req.post?
   end
   ```

3. **Backup Codes**: 10 códigos de un solo uso
4. **Recovery**: Proceso de recuperación por email

## Tests

```ruby
# spec/models/user_2fa_spec.rb
RSpec.describe User, type: :model do
  describe '2FA' do
    let(:user) { create(:user) }
    
    it 'generates OTP secret' do
      user.enable_two_factor!
      expect(user.otp_secret).to be_present
      expect(user.otp_required_for_login).to be true
    end
    
    it 'validates correct OTP' do
      user.enable_two_factor!
      otp = user.current_otp
      expect(user.validate_and_consume_otp!(otp)).to be true
    end
    
    it 'generates 10 backup codes' do
      user.enable_two_factor!
      expect(user.otp_backup_codes.count).to eq(10)
    end
  end
end
```

## Plan de Rollout

### Fase 1: Opcional (Semana 1-2)
- Deploy como feature opcional
- Monitor adopción

### Fase 2: Obligatorio para Admins (Semana 3)
- Requerir 2FA para todos los admins
- Periodo de gracia de 7 días

### Fase 3: Obligatorio para Veterinarios (Semana 4-5)
- Requerir 2FA para veterinarios
- Comunicación previa

### Fase 4: Opcional para Owners (Permanente)
- Mantener opcional
- Promover uso

## Enforcement por Rol

```ruby
# app/models/concerns/two_factor_enforceable.rb
module TwoFactorEnforceable
  def two_factor_required?
    role_admin? || role_veterinarian?
  end
  
  def enforce_two_factor!
    return if otp_required_for_login? || !two_factor_required?
    update_column(:require_2fa_setup, true)
  end
end

# Include en User model
include TwoFactorEnforceable

# Callback
after_sign_in :enforce_two_factor!
```

## Referencias

- [devise-two-factor gem](https://github.com/tinfoil/devise-two-factor)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [OWASP 2FA Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Tiempo estimado de implementación**: 2-3 días  
**Complejidad**: Media  
**Prioridad**: Alta para roles administrativos
