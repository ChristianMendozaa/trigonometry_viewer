# Pruebalo ahora   
https://trigonometry-viewer.vercel.app/ ingresa al link para poder probar la aplicacion en vivo.


# React + TypeScript Frontend

Este proyecto es una aplicación frontend construida con **React** y **TypeScript**. Actualmente, el proyecto está **en producción** y conectado a un servidor en producción.

Sigue las instrucciones a continuación para configurarlo y ejecutarlo localmente.

## 🛠️ Prerrequisitos
Asegúrate de tener instalado lo siguiente en tu máquina:

- **Node.js** (v18 o superior)
- **npm** (v9 o superior) o **yarn**
- **Git**

## 🚀 Instalación
1. **Clona el repositorio:**
```bash
git clone https://github.com/usuario/nombre-del-repo.git
cd nombre-del-repo
```

2. **Instala las dependencias:**
```bash
npm install
# o
yarn install
```

## 📦 Configuración
1. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias. Por ejemplo:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

2. Asegúrate de que cualquier servicio externo (como la API) esté disponible si es necesario.

## 🚀 Ejecución
Para iniciar el proyecto en modo de desarrollo, ejecuta el siguiente comando:
```bash
npm run dev
# o
yarn dev
```

Por defecto, la aplicación estará disponible en `http://localhost:5173` si usas Vite o `http://localhost:3000` si usas React con Create React App.

## 🧪 Scripts Disponibles
- **`npm run dev`**: Ejecuta el proyecto en modo desarrollo.
- **`npm run build`**: Compila el proyecto para producción.
- **`npm run lint`**: Ejecuta el linter para revisar el código.
- **`npm run test`**: Ejecuta las pruebas unitarias.

## 📚 Estructura del Proyecto
```bash
/src
  ├── assets          # Recursos estáticos como imágenes y fuentes
  ├── components       # Componentes reutilizables
  ├── hooks            # Custom Hooks
  ├── pages            # Páginas principales
  ├── services         # Servicios y llamadas a API
  ├── utils            # Utilidades y funciones auxiliares
  ├── App.tsx          # Componente principal
  └── main.tsx         # Punto de entrada
```

## ✅ Contribuciones
Si deseas contribuir a este proyecto, por favor sigue los siguientes pasos:
1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube los cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## 📝 Licencia
Este proyecto está bajo la licencia [MIT](LICENSE).

---

¡Gracias por contribuir y usar este proyecto! 😊

