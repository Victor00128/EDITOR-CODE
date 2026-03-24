# ⚡ Zenith IDE

> A Cyberpunk-themed Integrated Development Environment powered by AI.

Zenith IDE es un editor de código moderno construido con **Electron** y **React**, diseñado para potenciar la productividad mediante la integración profunda de Inteligencia Artificial (Gemini). No es solo un wrapper de chat; el agente tiene control sobre el sistema de archivos, terminal real y capacidad de "auto-reparación".

![Zenith IDE](./assets/zenith-screenshot.png)

## 🎯 Enfoque del producto

Zenith IDE esta pensado como una herramienta local para explorar flujos de desarrollo asistidos por IA con mas control que una simple ventana de chat. El objetivo del proyecto es juntar edicion, terminal, contexto del archivo y preview en una sola experiencia.

## 🚀 Características Principales

### 🧠 AI Agent "Consciente"
- **Gestión de Archivos:** El agente puede crear, leer, modificar y eliminar archivos y carpetas directamente.
- **Context Aware:** Entiende la estructura completa de tu proyecto y el archivo que estás editando.
- **Diff View Multi-archivo:** Revisa los cambios propuestos por la AI en una vista de diferencias (Diff) antes de aplicarlos.

### 🛡️ Self-Healing Preview
- **Detección de Errores en Tiempo Real:** El entorno de previsualización web captura errores de ejecución (JavaScript) y los envía de vuelta al agente de AI.
- **Auto-Fix:** La AI recibe el error automáticamente y propone una solución en el código.

### 💻 Terminal Real Integrada
- Implementación de **xterm.js** conectada a **node-pty** mediante IPC de Electron.
- Ejecuta comandos reales del sistema (`npm`, `git`, `docker`) directamente desde el IDE.

### ⚡ Experiencia de Desarrollo
- **Monaco Editor:** El mismo núcleo que VS Code, con resaltado de sintaxis y minimapa.
- **AI Autocomplete:** Sugerencias de código inteligentes mientras escribes (con debounce para rendimiento).
- **Hot Reloading:** El árbol de archivos se actualiza en tiempo real si hay cambios externos (usando `chokidar`).
- **Búsqueda Global:** Búsqueda rápida de texto y Regex en todo el proyecto.

## 🛠️ Tech Stack

| Categoría | Tecnologías |
|-----------|-------------|
| **Core** | Electron, React, TypeScript, Vite |
| **State Management** | Zustand |
| **Editor & Terminal** | Monaco Editor, XTerm.js, Node-PTY |
| **AI** | Google Generative AI (Gemini) |
| **Styling** | TailwindCSS |
| **File System** | Node.js FS, Chokidar |

## 📦 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Victor00128/EDITOR-CODE.git
   cd EDITOR-CODE
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

   Luego agrega tu API key:
   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```
   
   Obtén tu API key en: [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Crear build de producción**
   ```bash
   npm run electron-pack
   ```

## 🎯 Uso Básico

1. Abre el IDE y selecciona una carpeta de proyecto con **"Open Local Folder"**
2. Navega por tus archivos en el **Explorer** (panel izquierdo)
3. Edita código en el **Editor** central con syntax highlighting
4. Usa el **AI Agent** (panel derecho) para:
   - Generar código nuevo
   - Modificar archivos existentes
   - Obtener explicaciones del código
5. Visualiza tus cambios en tiempo real con el **Live Preview**
6. Ejecuta comandos en la **Terminal** integrada

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.
