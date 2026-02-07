# Documentació de l'API REST del Blog

API REST completa per a la gestió d'un blog, construïda amb **Node.js**, **Express** i **MongoDB** (Mongoose). Inclou autenticació JWT per protegir les operacions d'escriptura.

## Taula de Continguts
- [Instal·lació i Execució](#instal·lació-i-execució)
- [Autenticació](#autenticació)
- [Models de Dades](#models-de-dades)
- [Endpoints de l'API](#endpoints-de-lapi)
  - [Usuaris (Auth)](#usuaris-auth)
  - [Posts (Articles)](#posts-articles)

## Instal·lació i Execució

1. **Prerequisits**: Tenir instal·lat Node.js i MongoDB.
2. **Instal·lar dependències**:
   ```bash
   npm install
   ```
3. **Configuració**:
   Crea un arxiu `.env` a l'arrel del projecte amb:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/blogapi
   JWT_SECRET=la_teva_clau_secreta_super_segura
   ```
4. **Executar**:
   - Desenvolupament: `npm run dev`
   - Producció: `npm start`

## Autenticació

Aquesta API utilitza **JSON Web Tokens (JWT)** per a l'autenticació.
- Els endpoints públics (GET posts) no requereixen token.
- Els endpoints protegits (POST, PUT, DELETE posts, Profile) requereixen enviar el token a la capçalera de la petició.

**Format del Header:**
```
Authorization: Bearer <EL_TEU_TOKEN_JWT>
```

---

## Models de Dades

### Usuari (User)
| Camp       | Tipus    | Descripció                                      |
|------------|----------|--------------------------------------------------|
| `email`    | String   | Correu electrònic únic (obligatori).             |
| `password` | String   | Contrasenya encriptada (mínim 6 caràcters).      |
| `createdAt`| Date     | Data de creació (automàtica).                    |

### Post (Article)
| Camp        | Tipus    | Descripció                                           |
|-------------|----------|-------------------------------------------------------|
| `title`     | String   | Títol del post (obligatori).                          |
| `text`      | String   | Contingut del post (obligatori).                      |
| `estat`     | String   | Estat: `'esborrany'` o `'publicat'` (obligatori).     |
| `categoria` | String   | Categoria del post (opcional).                        |
| `etiquetes` | [String] | Array d'etiquetes (opcional).                         |
| `usuari`    | String   | Email de l'autor/editor (automàtic amb el token).     |
| `createdAt` | Date     | Data de creació (automàtica).                         |

---

## Endpoints de l'API

### Usuaris (Auth)

#### 1. Registre d'un nou usuari
Crea un nou compte d'usuari i retorna el token d'accés.

- **Mètode:** `POST`
- **URL:** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "nouusuari@exemple.com",
    "password": "password123"
  }
  ```
- **Resposta (201 Created):**
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "email": "nouusuari@exemple.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. Inici de Sessió (Login)
Autentica un usuari existent i retorna el token d'accés.

- **Mètode:** `POST`
- **URL:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "usuari@exemple.com",
    "password": "password123"
  }
  ```

#### 3. Obtenir Perfil (Protegit)
Retorna les dades de l'usuari autenticat.

- **Mètode:** `GET`
- **URL:** `/api/auth/profile`
- **Header:** `Authorization: Bearer <token>`

---

### Posts (Articles)

#### 1. Llistar tots els posts
Obté una llista de tots els posts, ordenats per data de creació descendent.

- **Mètode:** `GET`
- **URL:** `/api/posts`
- **Accés:** Públic

#### 2. Obtenir un post per ID
- **Mètode:** `GET`
- **URL:** `/api/posts/:id`
- **Accés:** Públic

#### 3. Crear un nou post (Protegit)
- **Mètode:** `POST`
- **URL:** `/api/posts`
- **Header:** `Authorization: Bearer <token>`
- **Body (Exemple):**
  ```json
  {
    "title": "El meu primer post",
    "text": "Contingut molt interessant...",
    "estat": "esborrany",
    "categoria": "General",
    "etiquetes": ["hola", "món"]
  }
  ```
  *(Nota: El camp `usuari` s'assigna automàticament des del token)*

#### 4. Actualitzar un post (Protegit)
Modifica un post existent. Pots enviar només els camps que vols canviar.

- **Mètode:** `PUT`
- **URL:** `/api/posts/:id`
- **Header:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "estat": "publicat",
    "text": "Text actualitzat!"
  }
  ```

#### 5. Eliminar un post (Protegit)
- **Mètode:** `DELETE`
- **URL:** `/api/posts/:id`
- **Header:** `Authorization: Bearer <token>`
