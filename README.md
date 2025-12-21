# ⚡ Zenith IDE

> A Cyberpunk-themed Integrated Development Environment powered by AI.

Zenith IDE es un editor de código moderno construido con **Electron** y **React**, diseñado para potenciar la productividad mediante la integración profunda de Inteligencia Artificial (Gemini). No es solo un wrapper de chat; el agente tiene control sobre el sistema de archivos, terminal real y capacidad de "auto-reparación".

![Zenith IDE Screenshot](https://via.placeholder.com/800x450?text=Insertar+Screenshot+Aqui)
*(Te recomiendo subir una captura de pantalla aquí)*

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

- **Core:** Electron, React, TypeScript, Vite.
- **State Management:** Zustand.
- **Editor & Terminal:** Monaco Editor (React), XTerm.js, Node-PTY.
- **AI:** Google Generative AI (Gemini).
- **Styling:** TailwindCSS.
- **File System:** Node.js FS, Chokidar (Watchers).

## 📦 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/zenith-ide.git
   cd zenith-ide
