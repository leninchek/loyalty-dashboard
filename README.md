# Loyalty Dashboard

Dashboard administrativo moderno y reactivo para la gestión del programa de lealtad usando Firebase y que complementa la aplicación [Loyalty-iOS](https://github.com/leninchek/loyalty-app-ios).

## 🏗️ Arquitectura
Desarrollado con **Next.js 15**, **Tailwind CSS** y **Firebase**.

## 🚀 Características Principales

- **KPIs en Tiempo Real**: Visualización instantánea del total de puntos (pasivo) y clientes registrados.
- **Top Clientes**: Tabla reactiva con los 10 mejores clientes, actualizada al momento.
- **Historial de Ventas en Vivo**: Tabla paginada que muestra las transacciones recientes en tiempo real.
- **Reportes**: Generación de reportes CSV filtrados por fecha.
- **Optimización**: Uso de ISR (Incremental Static Regeneration) y contadores agregados para minimizar costos de Firebase.
- **Configuración**: Puedes apagar y encender el envío de SMS.

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS + Shadcn UI
- **Base de Datos**: Firebase Firestore (Client SDK)
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

1.  **Node.js** (v18 o superior)
2.  **Firebase CLI** (`npm install -g firebase-tools`)
3.  Acceso al proyecto Firebase `loyalty-redemption`.

## ⚙️ Configuración y Despliegue

### 1. Instalación
```bash
npm install
```

### 2. Ejecución Local
```bash
npm run dev
```
El dashboard estará disponible en `http://localhost:9002`.

### 3. Índices
Para optimizar las consultas, despliega los índices compuestos:
```bash
firebase deploy --only firestore:indexes
```

## 📂 Estructura del Proyecto

- `src/app`: Rutas y páginas (App Router).
- `src/components/dashboard`: Componentes específicos (KpiSection, SalesTable, etc.).
- `src/lib/data.ts`: Lógica de acceso a datos (Server Actions y utilidades).
- `src/firebase`: Configuración del cliente Firebase.
