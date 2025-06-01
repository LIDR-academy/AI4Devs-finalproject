# Script para actualizar los perfiles de AutoMapper

# Actualizar AccesoProfile.cs
$accesoProfilePath = "src\ConsultCore31.Application\Mappings\Acceso\AccesoProfile.cs"
(Get-Content $accesoProfilePath) -replace 'using AutoMapper;', 'using AutoMapper;' + [Environment]::NewLine + 'using Profile = AutoMapper.Profile;' | Set-Content $accesoProfilePath

# Actualizar ObjetoTipoProfile.cs
$objetoTipoProfilePath = "src\ConsultCore31.Application\Mappings\ObjetoTipo\ObjetoTipoProfile.cs"
(Get-Content $objetoTipoProfilePath) -replace 'using AutoMapper;', 'using AutoMapper;' + [Environment]::NewLine + 'using Profile = AutoMapper.Profile;' | Set-Content $objetoTipoProfilePath

# Actualizar ObjetoProfile.cs
$objetoProfilePath = "src\ConsultCore31.Application\Mappings\Objeto\ObjetoProfile.cs"
(Get-Content $objetoProfilePath) -replace 'using AutoMapper;', 'using AutoMapper;' + [Environment]::NewLine + 'using Profile = AutoMapper.Profile;' | Set-Content $objetoProfilePath

# Actualizar PerfilProfile.cs
$perfilProfilePath = "src\ConsultCore31.Application\Mappings\Perfil\PerfilProfile.cs"
(Get-Content $perfilProfilePath) -replace 'using AutoMapper;', 'using AutoMapper;' + [Environment]::NewLine + 'using Profile = AutoMapper.Profile;' | Set-Content $perfilProfilePath

# Actualizar UsuarioTokenProfile.cs
$usuarioTokenProfilePath = "src\ConsultCore31.Application\Mappings\UsuarioToken\UsuarioTokenProfile.cs"
(Get-Content $usuarioTokenProfilePath) -replace 'using AutoMapper;', 'using AutoMapper;' + [Environment]::NewLine + 'using Profile = AutoMapper.Profile;' | Set-Content $usuarioTokenProfilePath

# Actualizar UsuarioProfile.cs
$usuarioProfilePath = "src\ConsultCore31.Application\Mappings\Usuario\UsuarioProfile.cs"
(Get-Content $usuarioProfilePath) -replace 'using AutoMapper;', 'using AutoMapper;' + [Environment]::NewLine + 'using Profile = AutoMapper.Profile;' | Set-Content $usuarioProfilePath

Write-Host "Perfiles actualizados correctamente."
