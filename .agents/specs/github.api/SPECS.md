# API Specifications: GitHub API (SnapSkills Integration)

Esta especificación detalla cómo SnapSkills interactúa con la infraestructura de GitHub para buscar y obtener habilidades (archivos `SKILL.md`).

## 1. Búsqueda de Skills (Code Search API)

Se utiliza para encontrar archivos `SKILL.md` en GitHub que coincidan con la búsqueda del usuario.

### Request
```http
GET https://api.github.com/search/code?q=filename:SKILL.md+{query}
```

- **Headers Requeridos:**
  - `Accept: application/vnd.github.v3+json`
  - `Authorization: Bearer <GITHUB_TOKEN>` (Necesario para límites altos y buscar en repos privados del usuario).
  - `User-Agent: SnapSkills-Extension`

- **Rate Limits:**
  - Con Token (Personal Access Token): 30 peticiones por minuto.
  - Sin Token: 10 peticiones por minuto (no recomendado para la extensión).

### Response
```json
{
  "total_count": 1,
  "items": [
    {
      "name": "SKILL.md",
      "path": ".agents/skills/design/SKILL.md",
      "repository": {
        "full_name": "owner/repo",
        "description": "Repo description"
      }
    }
  ]
}
```

## 2. Obtener Detalles/Contenido (Raw Content)

Se utiliza para descargar el contenido exacto del archivo `SKILL.md` sin consumir cuota de la API REST principal, mediante el subdominio `raw.githubusercontent.com`.

### Request
```http
GET https://raw.githubusercontent.com/{owner}/{repo}/main/{path}
```
*(Nota: la rama puede variar, por defecto se intentará `main` o `master` si no se tiene explícita de la respuesta anterior).*

- **Headers:**
  - `Authorization: token <GITHUB_TOKEN>` (Solo requerido si el repositorio es **privado**).
  - No requiere el header `Accept` específico de API.

### Response
Retorna el archivo de texto plano (`text/plain`) con el contenido Markdown del skill.

---

## Integración con el Service Worker (Manifest V3)

Toda llamada a `api.github.com` o `raw.githubusercontent.com` debe realizarse desde el `service-worker.ts` para evitar problemas de CORS al inyectar código en páginas de IA. 

El flujo es:
1. Side Panel lee el token de `chrome.storage.local`.
2. Side Panel envía el token y la query al Service Worker mediante `chrome.runtime.sendMessage`.
3. Service Worker ejecuta la petición a GitHub.
4. Service Worker responde con la data formateada al Side Panel.
