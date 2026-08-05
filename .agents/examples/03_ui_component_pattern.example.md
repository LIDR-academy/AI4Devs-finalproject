# 📐 Patrón Agnóstico: Componente UI y Estados Defensivos

Este documento define la estructura abstracta (pseudocódigo) de un **Componente de Interfaz de Usuario** con abstracción por repositorio (DIP) y 4 estados defensivos. Es 100% agnóstico de UI framework (React, Vue, Angular, Svelte, Flutter, etc.).

---

## 🧩 Pseudocódigo de Referencia:

```text
INTERFAZ IRepositorioClienteUI:
    FUNCION obtenerRemanentes() -> ListaDeObjetos

HOOK_O_GESTOR_ESTADO useLogicaRemanentes(repositorio: IRepositorioClienteUI):
    estado datos = []
    estado estaCargando = Verdadero
    estado error = Nulo

    FUNCION cargarDatos():
        estaCargando = Verdadero
        error = Nulo
        TRATAR:
            datos = repositorio.obtenerRemanentes()
        CAPTURAR Excepcion COMO err:
            error = err.mensaje
        FINALMENTE:
            estaCargando = Falso

    RETORNAR { datos, estaCargando, error, reintentar: cargarDatos }

COMPONENTE_VISUAL VistaRemanentes(repositorio: IRepositorioClienteUI):
    logicaUI = useLogicaRemanentes(repositorio)

    // Estado 1: Carga (Loading Skeletons)
    SI logicaUI.estaCargando ENTONCES:
        RETORNAR RenderizarUI("<ContenedorSkeletonAnimado />")

    // Estado 2: Error con botón de reintento
    SI logicaUI.error NO ES NULO ENTONCES:
        RETORNAR RenderizarUI("""
            <BannerError mensaje={logicaUI.error}>
                <BotonTactil minDimension="48px" alPulsar={logicaUI.reintentar}>
                    Reintentar
                </BotonTactil>
            </BannerError>
        """)

    // Estado 3: Lista Vacía (Empty State)
    SI logicaUI.datos ES VACIA ENTONCES:
        RETORNAR RenderizarUI("<MensajeSinDatos texto='No hay remanentes disponibles' />")

    // Estado 4: Presentación Exitoso
    RETORNAR RenderizarUI("<ListaUI datos={logicaUI.datos} />")
```
