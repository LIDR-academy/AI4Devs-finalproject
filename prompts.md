> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

## 1. Descripción general del producto

**Prompt 1:**

Como si fuera un project manager, quiero que me generes un makdown que pueda copiar donde haga una descripcion del proyecto, las principales funcionalidades basicas y 3 historias de usuario.

El proyecto se trata de una aplicacion que me permita gestionar los pedidos de una charcuteria, donde tengro provedores, productos, tiendas e historial de inventario pedido.

La tienda tiene nombre e ID
El proveedor tiene nombre, telefono, nombre comercial  
Los articulos tiene nombre, codigo, proveedor, unidad pedido, unidad venta, notas, multiselector de en que tiendas se vende, y que cantidad ideal ha de tener por tienda.

Entonces quiero un panel de configuracion de tienda, de proveedores y de articulos y luego otro panel de pedidos En el panel donde hacer los pedidos por tienda y dias de la semana y me salga una lista de productos que he de pedir y se vea visualmente que he pedido y que no pedido aun.

Otro Panel de pedidos hechos, que se una tabla resumen de ver que se ha pedido y pueda ver incluso por dias, el historial

**Prompt 2:**

Generame 3 diagramas Mermaid en texto plano del uso de los 3 paneles (tienda, resumen, configuración) que pueda copiar en texto plano para introducir en un markdown.

Pasos de uso

1. Seleccionar trabajador
2. Introducir los valores
3. Se guarda automaticamente cada cambio y asi existe error humano

**Panel Resumen** Panel donde se puede ver el resumen de productos por tiendas

1. Visualización agrupada productos/tiendas
2. Edición de general
3. Check de revisado/pedido

**Panel Admin** Panel de configuración donde se crea, edita y elimina. - Anadir/Eliminar proveedores - Anadir/Eliminar productor por proveedor - Activar/Desactivar reset inventario semanal - Configuración venta activa/desactivada de productor y tienda - Opción de reset - Reset stock de todos los productos por tienda - Reset stock - Reset stocl de las 3 tiendas - Añadir/Eliminar empleado

**Prompt 3:**

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Siendo progrmador backend sql con que lenguajes de programcion me recomendarias montar el frontend para que sea facil y amigable?

**Prompt 2:**

Generame diferentes alternaticas de arquitectura que se adapten a mi proyecto

**Prompt 3:**

Como experto en arquitectura informatica, generame un diagrama explicando que mi aplicacion se compone:

- Frontend: hecho con html/css y javascript con el framework react
- Backend: hecho en java spring boot
- Base de datos: MySQL

Preguntame 3 dudas antes de generar el diagrama para generarlo con precision

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
