# ============================================================================
# FINANTIX - FRONTEND LOGIN MODULE IMPLEMENTATION PROMPT
# Authentication UI for Financial Core System
# ============================================================================
# Version: 1.0.0
# Target: Cursor AI / Claude
# Language: English + SudoLang
# Framework: Angular 19 + Fuse Template + Angular Material + Tailwind CSS
# ============================================================================

## CONTEXT

```sudolang
Project {
  name: "FINANTIX"
  type: "Financial Core System for Credit Unions (Ecuador)"
  
  frontend {
    framework: "Angular 19"
    template: "Fuse Admin Template"
    ui: "Angular Material"
    styling: "Tailwind CSS"
    stateManagement: "BehaviorSubject with Facade Pattern"
    architecture: "Hexagonal (Clean Architecture)"
  }
  
  existingStructure {
    authModule: "./modules/auth"
    interceptors: "src/app/core/interceptor/interceptor.ts"
    tokenController: "src/app/modules/auth/infrastructure/controller/controller.ts"
    guards: "src/app/core/auth/guards"
    lazyLoading: true
  }
  
  language {
    ui: "Spanish"
    code: "English (technical)"
    comments: "Spanish"
  }
}
```

## MISSION

Implement the complete login UI module following Fuse template patterns and hexagonal architecture.
Review and update existing auth module structure. Create all necessary components, services,
and state management for authentication flows.

---

## DESIGN SPECIFICATIONS

```sudolang
DesignSpecs {
  
  layout: "Split Screen" {
    left: "50% - Branding/Image Section"
    right: "50% - Login Form Section"
    
    leftSection {
      background: "Gradient or configurable image"
      content: [
        "Company Logo (configurable)",
        "Welcome message",
        "Decorative illustration or photo"
      ]
      animation: "Subtle fade-in"
    }
    
    rightSection {
      background: "White (light) / Dark gray (dark mode)"
      content: [
        "Login form",
        "Footer links"
      ]
      verticalAlignment: "center"
    }
  }
  
  theme {
    style: "Fuse default"
    colors: "Configurable per cooperative (future: from API)"
    darkMode: true
    
    defaultColors {
      primary: "#3B82F6"      // Blue
      accent: "#10B981"       // Green
      warn: "#EF4444"         // Red
      background: {
        light: "#F8FAFC"
        dark: "#1E293B"
      }
    }
  }
  
  logo {
    placeholder: true        // Use placeholder for now
    configurable: true       // Will be loaded from config module in future
    maxHeight: "60px"
    formats: ["SVG", "PNG"]
  }
  
  responsiveness {
    target: "Desktop only"
    minWidth: "1024px"
    breakpoints: {
      hide_left_section: "< 1024px"  // Show only form on small screens
    }
  }
}
```

---

## AUTHENTICATION FLOWS

```sudolang
AuthenticationFlows {
  
  flow Login {
    screen: "LoginComponent"
    route: "/auth/login"
    
    ui_elements {
      form {
        username: {
          type: "text"
          label: "Usuario"
          placeholder: "Ingrese su usuario"
          autocomplete: "username"
          autofocus: true
          prefill: "from localStorage (rememberMe)"
        }
        password: {
          type: "password"
          label: "Contraseña"
          placeholder: "Ingrese su contraseña"
          autocomplete: "current-password"
          showToggle: true              // Eye icon to show/hide
          blockCopyPaste: true          // Security measure
        }
        rememberMe: {
          type: "checkbox"
          label: "Recordar usuario"
          default: false
        }
        captcha: {
          type: "recaptcha"             // or simple math captcha
          showAfter: 3                  // Show after 3 failed attempts
          configurable: true            // Threshold from config
        }
      }
      
      buttons {
        submit: {
          text: "Iniciar Sesión"
          loading: "Ingresando..."
          disabled: "while submitting OR invalid form"
        }
      }
      
      links {
        forgotPassword: {
          text: "¿Olvidó su contraseña?"
          route: "/auth/forgot-password"
        }
      }
      
      indicators {
        serverStatus: {
          position: "top-right or footer"
          states: ["online", "offline", "checking"]
        }
        failedAttempts: {
          show: true
          format: "Intentos restantes: {remaining}"
          showWhen: "attempts > 0"
        }
      }
    }
    
    behaviors {
      onSuccess {
        IF response.requirePasswordChange THEN
          openChangePasswordModal()
        ELSE IF user.needsOfficeSelection THEN
          navigateTo("/auth/select-office")
        ELSE
          navigateTo(getDashboardByProfile(user.profile))
        
        IF rememberMe THEN
          saveUsername(localStorage)
      }
      
      onError {
        showGenericError("Credenciales inválidas")  // Security: generic message
        
        IF error.code == "OUTSIDE_SCHEDULE" THEN
          showScheduleInfo(error.schedule)          // Show allowed hours
        
        IF error.code == "ALREADY_LOGGED_IN" THEN
          showSessionConflictDialog()
        
        incrementFailedAttempts()
        
        IF failedAttempts >= captchaThreshold THEN
          showCaptcha()
        
        updateRemainingAttempts(error.remainingAttempts)
      }
      
      onInactivity {
        timeout: 300000  // 5 minutes in ms
        action: "clearForm and showInactivityMessage"
      }
    }
  }
  
  flow ChangePasswordModal {
    trigger: "response.requirePasswordChange == true"
    type: "MatDialog modal"
    closable: false  // User MUST change password
    
    ui_elements {
      form {
        currentPassword: {
          type: "password"
          label: "Contraseña actual"
          required: true
        }
        newPassword: {
          type: "password"
          label: "Nueva contraseña"
          required: true
          showToggle: true
          showStrength: true            // Password strength indicator
        }
        confirmPassword: {
          type: "password"
          label: "Confirmar contraseña"
          required: true
          mustMatch: "newPassword"
        }
      }
      
      passwordRequirements {
        show: true
        realTimeValidation: true
        items: [
          "Mínimo {min} caracteres",
          "Al menos una mayúscula",
          "Al menos una minúscula",
          "Al menos un número",
          "Al menos un carácter especial (!@#$%^&*)"
        ]
      }
      
      buttons {
        submit: "Cambiar Contraseña"
        cancel: null  // No cancel - must change
      }
    }
    
    onSuccess {
      closeModal()
      showSuccessToast("Contraseña actualizada correctamente")
      continueLoginFlow()  // Proceed to dashboard or office selection
    }
  }
  
  flow SelectOffice {
    screen: "SelectOfficeComponent"
    route: "/auth/select-office"
    trigger: "user.isContador OR user.hasMultipleOffices"
    
    ui_elements {
      header: "Seleccionar Oficina"
      subtitle: "Seleccione la oficina donde trabajará hoy"
      
      officeList {
        type: "mat-selection-list OR mat-radio-group"
        data: "user.allowedOffices"
        display: "{office.name} - {office.address}"
        defaultSelected: "user.lastOffice OR first"
      }
      
      buttons {
        continue: "Continuar"
        logout: "Cerrar Sesión"
      }
    }
    
    onContinue {
      saveSelectedOffice(session)
      navigateTo(getDashboardByProfile(user.profile))
    }
  }
  
  flow ForgotPassword {
    screen: "ForgotPasswordComponent"
    route: "/auth/forgot-password"
    
    ui_elements {
      form {
        email: {
          type: "email"
          label: "Correo electrónico"
          placeholder: "ejemplo@cooperativa.com"
        }
      }
      
      buttons {
        submit: "Enviar instrucciones"
        back: "Volver al inicio de sesión"
      }
    }
    
    onSuccess {
      // Always show success (security - don't reveal if email exists)
      showMessage("Si el correo existe en el sistema, recibirá instrucciones para restablecer su contraseña.")
      navigateTo("/auth/login", { delay: 3000 })
    }
  }
  
  flow ResetPassword {
    screen: "ResetPasswordComponent"
    route: "/auth/reset-password/:token"
    
    ui_elements {
      form {
        newPassword: { /* same as ChangePasswordModal */ }
        confirmPassword: { /* same as ChangePasswordModal */ }
      }
      passwordRequirements: { /* same as ChangePasswordModal */ }
    }
    
    onInvalidToken {
      showError("El enlace ha expirado o es inválido")
      showLink("Solicitar nuevo enlace", "/auth/forgot-password")
    }
  }
  
  flow SessionConflict {
    type: "MatDialog modal"
    trigger: "error.code == 'ALREADY_LOGGED_IN'"
    
    ui_elements {
      title: "Sesión Activa Detectada"
      message: "Ya tiene una sesión activa en otro dispositivo. ¿Desea cerrar la otra sesión e iniciar aquí?"
      
      sessionInfo {
        show: true
        data: "error.activeSession"
        display: [
          "Dispositivo: {device}",
          "IP: {ip}",
          "Última actividad: {lastActivity}"
        ]
      }
      
      buttons {
        forceLogin: {
          text: "Cerrar otra sesión e iniciar aquí"
          color: "primary"
        }
        cancel: {
          text: "Cancelar"
          color: "basic"
        }
      }
    }
    
    onForceLogin {
      callAPI: "POST /auth/force-login"
      continueLoginFlow()
    }
  }
}
```

---

## FILE STRUCTURE

```sudolang
FileStructure {
  
  base: "src/app/modules/auth"
  
  update_or_create {
    
    // ============================================
    // MODULE CONFIGURATION
    // ============================================
    
    "auth.module.ts" {
      action: "UPDATE"
      imports: [
        "CommonModule",
        "ReactiveFormsModule",
        "RouterModule",
        "MaterialModule (shared)",
        "RecaptchaModule (if using)"
      ]
      declarations: [
        "LoginComponent",
        "ForgotPasswordComponent",
        "ResetPasswordComponent",
        "SelectOfficeComponent",
        "ChangePasswordModalComponent",
        "SessionConflictDialogComponent",
        "PasswordStrengthComponent",
        "PasswordRequirementsComponent",
        "ServerStatusIndicatorComponent",
        "CaptchaComponent"
      ]
    }
    
    "auth.routes.ts" {
      action: "UPDATE"
      routes: [
        { path: "login", component: LoginComponent },
        { path: "forgot-password", component: ForgotPasswordComponent },
        { path: "reset-password/:token", component: ResetPasswordComponent },
        { path: "select-office", component: SelectOfficeComponent, canActivate: [AuthGuard] },
        { path: "", redirectTo: "login", pathMatch: "full" }
      ]
    }
    
    // ============================================
    // DOMAIN LAYER
    // ============================================
    
    "domain/entities/user.entity.ts" {
      action: "CREATE_OR_UPDATE"
      class: "UserEntity"
      properties: [
        "id: number",
        "uuid: string",
        "username: string",
        "nombreCompleto: string",
        "email: string | null",
        "empresaId: number",
        "oficinaId: number",
        "perfilId: number",
        "tipoUsuario: 'EMPLEADO' | 'EXTERNO' | 'SISTEMA'",
        "esAdmin: boolean",
        "accesoGlobal: boolean",
        "requiereCambioPassword: boolean",
        "oficinasPermitidas: OfficeEntity[]"
      ]
      methods: [
        "necesitaSeleccionarOficina(): boolean",
        "esContador(): boolean"
      ]
    }
    
    "domain/entities/office.entity.ts" {
      action: "CREATE"
      class: "OfficeEntity"
      properties: [
        "id: number",
        "codigo: string",
        "nombre: string",
        "direccion: string",
        "activo: boolean"
      ]
    }
    
    "domain/entities/session.entity.ts" {
      action: "CREATE"
      class: "SessionEntity"
      properties: [
        "id: string",
        "device: string",
        "ip: string",
        "lastActivity: Date",
        "current: boolean"
      ]
    }
    
    "domain/ports/auth.port.ts" {
      action: "CREATE_OR_UPDATE"
      interface: "IAuthPort"
      methods: [
        "login(credentials: LoginCredentials): Promise<LoginResponse>",
        "logout(): Promise<void>",
        "refreshToken(): Promise<TokenResponse>",
        "forgotPassword(email: string): Promise<void>",
        "resetPassword(token: string, password: string): Promise<void>",
        "changePassword(current: string, newPassword: string): Promise<void>",
        "forceLogin(credentials: LoginCredentials): Promise<LoginResponse>",
        "getActiveSessions(): Promise<SessionEntity[]>",
        "selectOffice(officeId: number): Promise<void>"
      ]
    }
    
    "domain/value-objects/login-credentials.vo.ts" {
      action: "CREATE"
      class: "LoginCredentials"
      properties: [
        "username: string",
        "password: string",
        "rememberMe: boolean",
        "captchaToken?: string"
      ]
    }
    
    // ============================================
    // APPLICATION LAYER
    // ============================================
    
    "application/facades/auth.facade.ts" {
      action: "CREATE_OR_UPDATE"
      class: "AuthFacade"
      
      state {
        interface: "AuthState"
        properties: [
          "user: UserEntity | null",
          "isAuthenticated: boolean",
          "isLoading: boolean",
          "error: string | null",
          "failedAttempts: number",
          "remainingAttempts: number | null",
          "requirePasswordChange: boolean",
          "captchaRequired: boolean",
          "serverOnline: boolean"
        ]
      }
      
      selectors: [
        "user$: Observable<UserEntity | null>",
        "isAuthenticated$: Observable<boolean>",
        "isLoading$: Observable<boolean>",
        "error$: Observable<string | null>",
        "failedAttempts$: Observable<number>",
        "remainingAttempts$: Observable<number | null>",
        "requirePasswordChange$: Observable<boolean>",
        "captchaRequired$: Observable<boolean>",
        "serverOnline$: Observable<boolean>"
      ]
      
      actions: [
        "login(credentials: LoginCredentials): Promise<void>",
        "logout(): Promise<void>",
        "forgotPassword(email: string): Promise<void>",
        "resetPassword(token: string, password: string): Promise<void>",
        "changePassword(current: string, newPassword: string): Promise<void>",
        "forceLogin(credentials: LoginCredentials): Promise<void>",
        "selectOffice(officeId: number): Promise<void>",
        "checkServerStatus(): Promise<void>",
        "clearError(): void",
        "resetFailedAttempts(): void"
      ]
    }
    
    "application/usecases/login.usecase.ts" {
      action: "CREATE"
      class: "LoginUseCase"
      description: "Orchestrates login flow with all validations"
      
      execute {
        1. "Validate form"
        2. "Call auth adapter"
        3. "Handle response (success/error/password change/office selection)"
        4. "Update state"
        5. "Track time on screen"
      }
    }
    
    // ============================================
    // INFRASTRUCTURE LAYER
    // ============================================
    
    "infrastructure/adapters/auth.adapter.ts" {
      action: "CREATE_OR_UPDATE"
      class: "AuthAdapter"
      implements: "IAuthPort"
      
      endpoints {
        login: "POST /api/v1/auth/login"
        logout: "POST /api/v1/auth/logout"
        refresh: "POST /api/v1/auth/refresh"
        forgotPassword: "POST /api/v1/auth/forgot-password"
        resetPassword: "POST /api/v1/auth/reset-password"
        changePassword: "POST /api/v1/auth/change-password"
        forceLogin: "POST /api/v1/auth/force-login"
        sessions: "GET /api/v1/auth/sessions"
        selectOffice: "POST /api/v1/auth/select-office"
        healthCheck: "GET /api/v1/health"
      }
    }
    
    "infrastructure/dto/request/login.request.dto.ts" {
      action: "CREATE"
      properties: [
        "username: string",
        "password: string",
        "captchaToken?: string"
      ]
    }
    
    "infrastructure/dto/response/login.response.dto.ts" {
      action: "CREATE"
      properties: [
        "accessToken: string",
        "refreshToken: string",
        "expiresIn: number",
        "tokenType: 'Bearer'",
        "user: UserDto",
        "requirePasswordChange?: boolean",
        "schedule?: ScheduleInfoDto",
        "activeSession?: ActiveSessionDto"
      ]
    }
    
    "infrastructure/state/auth.state.ts" {
      action: "CREATE"
      description: "BehaviorSubject-based state management"
      
      initialState {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        failedAttempts: 0,
        remainingAttempts: null,
        requirePasswordChange: false,
        captchaRequired: false,
        serverOnline: true
      }
    }
    
    "infrastructure/services/token-storage.service.ts" {
      action: "CREATE_OR_UPDATE"
      description: "Handles token storage and retrieval"
      
      methods: [
        "saveTokens(access: string, refresh: string): void",
        "getAccessToken(): string | null",
        "getRefreshToken(): string | null",
        "clearTokens(): void",
        "saveRememberedUsername(username: string): void",
        "getRememberedUsername(): string | null",
        "clearRememberedUsername(): void"
      ]
      
      storage: "Based on existing controller.ts implementation"
    }
    
    "infrastructure/services/inactivity.service.ts" {
      action: "CREATE"
      description: "Tracks user inactivity and triggers timeout"
      
      config {
        timeout: 300000  // 5 minutes
        events: ["mousemove", "keydown", "click", "scroll"]
      }
      
      methods: [
        "startTracking(): void",
        "stopTracking(): void",
        "resetTimer(): void",
        "onTimeout$: Observable<void>"
      ]
    }
    
    "infrastructure/services/telemetry.service.ts" {
      action: "CREATE"
      description: "Tracks time on screen"
      
      methods: [
        "startScreenTimer(screenName: string): void",
        "stopScreenTimer(): void",
        "getTimeOnScreen(): number"
      ]
    }
    
    // ============================================
    // INTERFACE LAYER (COMPONENTS)
    // ============================================
    
    "interface/views/login/login.component.ts" {
      action: "CREATE_OR_UPDATE"
      
      template: "Split screen layout"
      
      formControls: [
        "username: FormControl<string>",
        "password: FormControl<string>",
        "rememberMe: FormControl<boolean>",
        "captchaToken: FormControl<string>"
      ]
      
      injections: [
        "AuthFacade",
        "Router",
        "MatDialog",
        "InactivityService",
        "TelemetryService"
      ]
      
      lifecycle {
        ngOnInit: [
          "Load remembered username",
          "Start inactivity tracking",
          "Start telemetry",
          "Check server status",
          "Subscribe to facade observables"
        ]
        ngOnDestroy: [
          "Stop inactivity tracking",
          "Stop telemetry",
          "Unsubscribe all"
        ]
      }
      
      methods: [
        "onSubmit(): void",
        "onForgotPassword(): void",
        "togglePasswordVisibility(): void",
        "onCaptchaResolved(token: string): void",
        "openChangePasswordModal(): void",
        "openSessionConflictDialog(session: ActiveSession): void",
        "handleInactivityTimeout(): void"
      ]
    }
    
    "interface/views/login/login.component.html" {
      structure {
        div.login-container.split-screen {
          
          // Left Section - Branding
          div.branding-section {
            div.logo-container {
              img[src="logo.svg"]
            }
            h1.welcome-title: "Bienvenido a FINANTIX"
            p.welcome-subtitle: "Sistema de Core Financiero"
            div.illustration { /* Decorative image */ }
          }
          
          // Right Section - Form
          div.form-section {
            
            // Header
            div.form-header {
              h2: "Iniciar Sesión"
              server-status-indicator
            }
            
            // Form
            form.login-form {
              mat-form-field {
                mat-label: "Usuario"
                input[matInput][formControlName="username"]
                mat-icon[matPrefix]: "person"
                mat-error: "validation message"
              }
              
              mat-form-field {
                mat-label: "Contraseña"
                input[matInput][type="password"][formControlName="password"]
                mat-icon[matPrefix]: "lock"
                button[matSuffix][mat-icon-button]: "visibility toggle"
                mat-error: "validation message"
              }
              
              div.form-options {
                mat-checkbox[formControlName="rememberMe"]: "Recordar usuario"
                a.forgot-password[routerLink]: "¿Olvidó su contraseña?"
              }
              
              // Captcha (conditional)
              captcha-component[*ngIf="captchaRequired"]
              
              // Failed attempts indicator
              div.attempts-indicator[*ngIf="failedAttempts > 0"] {
                mat-icon: "warning"
                span: "Intentos restantes: {{ remainingAttempts }}"
              }
              
              // Error message
              div.error-message[*ngIf="error"] {
                mat-icon: "error"
                span: "{{ error }}"
              }
              
              // Submit button
              button[mat-raised-button][color="primary"][type="submit"] {
                span[*ngIf="!isLoading"]: "Iniciar Sesión"
                mat-spinner[*ngIf="isLoading"][diameter="20"]
              }
            }
            
            // Footer
            div.form-footer {
              span.version: "v{{ version }}"
              div.footer-links {
                a: "Términos de uso"
                a: "Privacidad"
                a: "Ayuda"
              }
            }
          }
        }
      }
    }
    
    "interface/views/login/login.component.scss" {
      styles {
        // Split screen layout
        // Responsive adjustments
        // Dark mode support
        // Animations
      }
    }
    
    "interface/views/forgot-password/forgot-password.component.ts"
    "interface/views/forgot-password/forgot-password.component.html"
    "interface/views/forgot-password/forgot-password.component.scss"
    
    "interface/views/reset-password/reset-password.component.ts"
    "interface/views/reset-password/reset-password.component.html"
    "interface/views/reset-password/reset-password.component.scss"
    
    "interface/views/select-office/select-office.component.ts"
    "interface/views/select-office/select-office.component.html"
    "interface/views/select-office/select-office.component.scss"
    
    // Shared Components
    "interface/components/change-password-modal/change-password-modal.component.ts" {
      type: "MatDialog"
      disableClose: true
      
      features: [
        "Current password field",
        "New password with strength indicator",
        "Confirm password with match validation",
        "Real-time requirements checklist",
        "Cannot close without changing"
      ]
    }
    
    "interface/components/session-conflict-dialog/session-conflict-dialog.component.ts" {
      type: "MatDialog"
      
      data: "ActiveSessionDto"
      
      actions: [
        "Force login (close other session)",
        "Cancel"
      ]
    }
    
    "interface/components/password-strength/password-strength.component.ts" {
      inputs: ["password: string"]
      outputs: ["strengthChange: EventEmitter<number>"]
      
      display: "Progress bar with color (red/yellow/green)"
      levels: ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"]
    }
    
    "interface/components/password-requirements/password-requirements.component.ts" {
      inputs: [
        "password: string",
        "requirements: PasswordRequirements"
      ]
      
      display: "Checklist with icons (✓ or ✗)"
      realTimeValidation: true
    }
    
    "interface/components/server-status/server-status.component.ts" {
      display: "Icon with tooltip"
      states: {
        online: { icon: "cloud_done", color: "green", tooltip: "Servidor en línea" }
        offline: { icon: "cloud_off", color: "red", tooltip: "Sin conexión al servidor" }
        checking: { icon: "cloud_sync", color: "yellow", tooltip: "Verificando conexión..." }
      }
      
      polling: "Every 30 seconds"
    }
    
    "interface/components/captcha/captcha.component.ts" {
      type: "Simple math captcha OR reCAPTCHA"
      
      mathCaptcha {
        format: "{{ num1 }} + {{ num2 }} = ?"
        regenerateOnError: true
      }
      
      outputs: ["resolved: EventEmitter<string>"]
    }
  }
}
```

---

## VALIDATION MESSAGES (SPANISH)

```sudolang
ValidationMessages {
  
  login {
    username: {
      required: "El nombre de usuario es requerido"
      minlength: "El nombre de usuario debe tener al menos 3 caracteres"
      maxlength: "El nombre de usuario no puede exceder 50 caracteres"
    }
    password: {
      required: "La contraseña es requerida"
      minlength: "La contraseña debe tener al menos 8 caracteres"
    }
    captcha: {
      required: "Complete la verificación de seguridad"
      invalid: "Verificación incorrecta. Intente nuevamente."
    }
  }
  
  changePassword {
    currentPassword: {
      required: "La contraseña actual es requerida"
      invalid: "La contraseña actual es incorrecta"
    }
    newPassword: {
      required: "La nueva contraseña es requerida"
      minlength: "La contraseña debe tener al menos {min} caracteres"
      maxlength: "La contraseña no puede exceder {max} caracteres"
      uppercase: "Debe contener al menos una mayúscula"
      lowercase: "Debe contener al menos una minúscula"
      number: "Debe contener al menos un número"
      special: "Debe contener al menos un carácter especial"
      history: "No puede reutilizar una contraseña reciente"
    }
    confirmPassword: {
      required: "Confirme la nueva contraseña"
      mismatch: "Las contraseñas no coinciden"
    }
  }
  
  forgotPassword {
    email: {
      required: "El correo electrónico es requerido"
      invalid: "Ingrese un correo electrónico válido"
    }
  }
  
  resetPassword {
    token: {
      invalid: "El enlace ha expirado o es inválido"
      expired: "El enlace ha expirado. Solicite uno nuevo."
    }
  }
}
```

---

## ERROR MESSAGES (SPANISH - GENERIC FOR SECURITY)

```sudolang
ErrorMessages {
  
  // Login errors - GENERIC for security
  LOGIN_FAILED: "Credenciales inválidas"
  
  // Show additional info only when safe
  ACCOUNT_LOCKED: "Usuario bloqueado temporalmente. Intente en {minutes} minutos."
  ACCOUNT_LOCKED_PERMANENT: "Usuario bloqueado. Contacte al administrador."
  
  OUTSIDE_SCHEDULE: "Acceso no permitido en este horario. Horario permitido: {start} - {end}"
  
  ALREADY_LOGGED_IN: "Ya tiene una sesión activa en otro dispositivo."
  
  // Generic errors
  SERVER_ERROR: "Error de conexión. Intente nuevamente."
  NETWORK_ERROR: "Sin conexión a internet. Verifique su conexión."
  SESSION_EXPIRED: "Su sesión ha expirado. Inicie sesión nuevamente."
  
  // Password reset
  RESET_TOKEN_INVALID: "El enlace ha expirado o es inválido."
  RESET_TOKEN_USED: "Este enlace ya fue utilizado."
  
  // Password change
  PASSWORD_CHANGE_FAILED: "No se pudo cambiar la contraseña. Intente nuevamente."
  PASSWORD_IN_HISTORY: "No puede reutilizar una contraseña reciente."
  
  // Inactivity
  INACTIVITY_TIMEOUT: "Por inactividad, el formulario ha sido limpiado."
}
```

---

## INTERCEPTOR UPDATES

```sudolang
InterceptorUpdates {
  
  file: "src/app/core/interceptor/interceptor.ts"
  action: "UPDATE"
  
  features {
    
    addAuthorizationHeader {
      description: "Add Bearer token to all requests"
      exclude: ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/health"]
      
      implementation {
        const token = tokenStorage.getAccessToken()
        IF token THEN
          request = request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          })
      }
    }
    
    handleTokenRefresh {
      description: "Auto-refresh token on 401"
      
      implementation {
        IF response.status == 401 AND NOT isRefreshing THEN
          isRefreshing = true
          TRY
            refreshResponse = await authAdapter.refreshToken()
            tokenStorage.saveTokens(refreshResponse)
            isRefreshing = false
            RETRY original request with new token
          CATCH
            isRefreshing = false
            authFacade.logout()
            router.navigate(['/auth/login'])
      }
    }
    
    handleOfflineMode {
      description: "Detect offline status"
      
      implementation {
        IF error.status == 0 OR error.status == 504 THEN
          authFacade.setServerOffline()
          THROW "Sin conexión al servidor"
      }
    }
  }
}
```

---

## GUARDS UPDATES

```sudolang
GuardsUpdates {
  
  file: "src/app/core/auth/guards"
  
  AuthGuard {
    action: "UPDATE"
    
    canActivate {
      IF NOT authFacade.isAuthenticated THEN
        router.navigate(['/auth/login'])
        RETURN false
      
      IF tokenExpired AND canRefresh THEN
        TRY refresh
        CATCH navigate to login
      
      RETURN true
    }
  }
  
  NoAuthGuard {
    action: "CREATE"
    description: "Prevent authenticated users from accessing login"
    
    canActivate {
      IF authFacade.isAuthenticated THEN
        router.navigate(['/dashboard'])
        RETURN false
      
      RETURN true
    }
  }
  
  OfficeSelectedGuard {
    action: "CREATE"
    description: "Ensure user has selected office if required"
    
    canActivate {
      IF user.needsOfficeSelection AND NOT session.officeSelected THEN
        router.navigate(['/auth/select-office'])
        RETURN false
      
      RETURN true
    }
  }
}
```

---

## STYLING GUIDELINES

```sudolang
StylingGuidelines {
  
  framework: "Tailwind CSS + Angular Material"
  
  loginPage {
    
    splitScreen {
      // Container
      ".login-container": "flex h-screen w-screen"
      
      // Left section (branding)
      ".branding-section": """
        w-1/2 
        bg-gradient-to-br from-primary-600 to-primary-800
        dark:from-gray-800 dark:to-gray-900
        flex flex-col items-center justify-center
        p-12
        hidden lg:flex
      """
      
      // Right section (form)
      ".form-section": """
        w-full lg:w-1/2
        bg-white dark:bg-gray-900
        flex flex-col items-center justify-center
        p-8
      """
    }
    
    form {
      ".login-form": "w-full max-w-md space-y-6"
      
      "mat-form-field": "w-full"
      
      ".form-options": "flex justify-between items-center"
      
      ".forgot-password": """
        text-primary-600 hover:text-primary-800
        dark:text-primary-400
        text-sm
      """
    }
    
    indicators {
      ".attempts-indicator": """
        flex items-center gap-2
        text-amber-600 dark:text-amber-400
        bg-amber-50 dark:bg-amber-900/20
        p-3 rounded-lg
      """
      
      ".error-message": """
        flex items-center gap-2
        text-red-600 dark:text-red-400
        bg-red-50 dark:bg-red-900/20
        p-3 rounded-lg
      """
    }
    
    footer {
      ".form-footer": """
        mt-8 pt-6 border-t border-gray-200 dark:border-gray-700
        flex justify-between items-center
        text-sm text-gray-500
      """
    }
    
    darkMode {
      // Use Tailwind dark: prefix
      // Respect system preference or user toggle
    }
  }
}
```

---

## BIOMETRIC PREPARATION (FUTURE)

```sudolang
BiometricPreparation {
  
  description: "Architecture prepared for future biometric login"
  
  interface {
    "domain/ports/biometric.port.ts" {
      interface: "IBiometricPort"
      methods: [
        "isSupported(): Promise<boolean>",
        "isEnrolled(userId: string): Promise<boolean>",
        "authenticate(): Promise<BiometricResult>",
        "enroll(userId: string): Promise<void>"
      ]
    }
  }
  
  placeholder {
    "infrastructure/adapters/biometric.adapter.ts" {
      description: "Placeholder that returns isSupported: false"
      
      implementation: "Will use WebAuthn API in future"
    }
  }
  
  uiPreparation {
    // Add hidden/disabled biometric button in login form
    // Will be enabled when biometric adapter is implemented
    
    button {
      icon: "fingerprint"
      text: "Acceso biométrico"
      disabled: true
      tooltip: "Próximamente"
    }
  }
}
```

---

## IMPLEMENTATION ORDER

```sudolang
ImplementationOrder {
  
  phase1: "Core Infrastructure" {
    1. "Review and update existing auth module structure"
    2. "Create/update domain entities (User, Office, Session)"
    3. "Create/update ports (IAuthPort)"
    4. "Create/update DTOs"
    5. "Create auth state management (auth.state.ts)"
    6. "Create/update AuthFacade"
    7. "Create/update AuthAdapter"
  }
  
  phase2: "Services" {
    1. "Update token storage service"
    2. "Create inactivity service"
    3. "Create telemetry service"
    4. "Update HTTP interceptor"
  }
  
  phase3: "Shared Components" {
    1. "PasswordStrengthComponent"
    2. "PasswordRequirementsComponent"
    3. "ServerStatusIndicatorComponent"
    4. "CaptchaComponent"
  }
  
  phase4: "Main Views" {
    1. "LoginComponent (with split screen layout)"
    2. "ChangePasswordModalComponent"
    3. "SessionConflictDialogComponent"
    4. "ForgotPasswordComponent"
    5. "ResetPasswordComponent"
    6. "SelectOfficeComponent"
  }
  
  phase5: "Guards and Routing" {
    1. "Update AuthGuard"
    2. "Create NoAuthGuard"
    3. "Create OfficeSelectedGuard"
    4. "Update auth.routes.ts"
  }
  
  phase6: "Testing & Polish" {
    1. "Unit tests for AuthFacade"
    2. "Unit tests for components"
    3. "Dark mode verification"
    4. "Accessibility check"
    5. "Performance optimization"
  }
  
  phase7: "Documentation" {
    1. "Generate module documentation"
    2. "Update README"
    3. "Create CHANGELOG entry"
  }
}
```

---

## TESTING REQUIREMENTS

```sudolang
TestRequirements {
  
  unitTests {
    coverage: ">= 80%"
    
    facade {
      "AuthFacade - login success flow"
      "AuthFacade - login with password change required"
      "AuthFacade - login with office selection required"
      "AuthFacade - login failure increments attempts"
      "AuthFacade - captcha appears after threshold"
      "AuthFacade - logout clears state"
      "AuthFacade - server status updates"
    }
    
    components {
      "LoginComponent - form validation"
      "LoginComponent - submit calls facade"
      "LoginComponent - shows error messages"
      "LoginComponent - inactivity clears form"
      "PasswordStrength - calculates correctly"
      "PasswordRequirements - validates in real-time"
      "Captcha - generates and validates"
    }
    
    services {
      "TokenStorageService - saves and retrieves"
      "InactivityService - triggers after timeout"
      "TelemetryService - tracks time correctly"
    }
  }
}
```

---

## DOCUMENTATION GENERATION

```sudolang
Documentation {
  
  generate "docs/modules/frontend-auth/README.md" {
    sections {
      1. "Overview"
      2. "Architecture"
      3. "Components"
      4. "State Management"
      5. "Styling"
      6. "Configuration"
      7. "Testing"
    }
  }
  
  generate "docs/modules/frontend-auth/COMPONENTS.md" {
    content: "Detailed component documentation with inputs/outputs"
  }
  
  generate "docs/modules/frontend-auth/CHANGELOG.md" {
    format: "Keep a Changelog"
    initialVersion: "1.0.0"
  }
}
```

---

## FINAL CHECKLIST

```sudolang
Checklist {
  
  functionality {
    [ ] Login form with validation
    [ ] Remember username
    [ ] Show/hide password toggle
    [ ] Block copy/paste on password
    [ ] Captcha after failed attempts
    [ ] Inactivity timeout (5 min)
    [ ] Failed attempts counter
    [ ] Server status indicator
    [ ] Change password modal
    [ ] Session conflict dialog
    [ ] Forgot password flow
    [ ] Reset password flow
    [ ] Office selection (for contador)
    [ ] Redirect by profile
  }
  
  design {
    [ ] Split screen layout
    [ ] Fuse default styling
    [ ] Dark mode support
    [ ] Logo placeholder
    [ ] Version in footer
    [ ] Footer links
  }
  
  security {
    [ ] Generic error messages
    [ ] Password visibility toggle
    [ ] Copy/paste blocked on password
    [ ] Captcha after threshold
    [ ] Session conflict detection
    [ ] Token refresh handling
  }
  
  ux {
    [ ] Loading states
    [ ] Error messages (Spanish)
    [ ] Validation messages (Spanish)
    [ ] Autofocus on username
    [ ] Keyboard navigation
  }
  
  code {
    [ ] Hexagonal architecture
    [ ] Facade pattern for state
    [ ] Lazy loading
    [ ] Proper typing
    [ ] Spanish comments
  }
  
  documentation {
    [ ] README.md
    [ ] COMPONENTS.md
    [ ] CHANGELOG.md
  }
}
```

---

## START IMPLEMENTATION

Begin with Phase 1: Review the existing auth module structure at `./modules/auth`.
Update or create the domain entities and ports following hexagonal architecture.
Then proceed to create the AuthFacade with BehaviorSubject-based state management.

First, explore the existing structure and report what exists and what needs to be created/updated.
