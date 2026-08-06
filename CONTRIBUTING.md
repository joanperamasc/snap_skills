# Contributing to SnapSkills

¡Primero que nada, gracias por considerar contribuir a SnapSkills! Son personas como tú las que hacen que proyectos como este sean increíbles.

## Código de Conducta
Al participar en este proyecto, esperamos que mantengas un ambiente de respeto, colaboración y ayuda mutua. 

## ¿Cómo puedo contribuir?

### Reportar Bugs (Errores)
Si encuentras un error, por favor crea un *Issue* en GitHub con los siguientes detalles:
- Un título claro y descriptivo.
- Los pasos para reproducir el problema.
- El comportamiento esperado vs. el comportamiento actual.
- Versión del navegador (ej. Chrome 116).

### Sugerir Mejoras
¡Las ideas para nuevas funcionalidades son súper bienvenidas! Por favor, crea un *Issue* explicando:
- El problema que resuelve tu idea.
- Cómo debería funcionar.
- Por qué esta mejora sería útil para la mayoría de los usuarios.

### Pull Requests (PRs)
Estamos encantados de recibir tus Pull Requests con código nuevo. Como tenemos la rama `main` protegida, este es el flujo de trabajo obligatorio:

1. Haz un **Fork** del repositorio a tu cuenta y crea tu propia rama a partir de `main` (ej. `git checkout -b feature/mi-nueva-idea`).
2. **Instala las dependencias**: ejecuta `npm install`.
3. **Haz tus cambios**: asegúrate de seguir el estilo del proyecto (React 19, Vite, Tailwind CSS v4, Chrome Extension MV3, next-intl).
4. **Prueba tus cambios**: Construye la extensión (`npm run build`) y pruébala localmente en Chrome cargando la carpeta `dist`.
5. **Crea el PR**: Asegúrate de que la descripción de tu PR explique claramente el problema y la solución usando nuestra plantilla.

## Configuración del Proyecto (Desarrollo Local)
Para empezar a desarrollar localmente, sigue estos pasos en tu terminal:

```bash
git clone https://github.com/joanperamasc/snap_skills.git
cd snap_skills
npm install
npm run build
```
Luego carga la extensión *unpacked* desde `chrome://extensions/`.

¡Gracias por tu contribución!
