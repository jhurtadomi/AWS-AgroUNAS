### Tabla de decisiones: /api/auth/login

| Caso | Origen credenciales | Usuario enviado | Password enviada | Header Authorization              | ¿Credenciales vacías? | Resultado esperado |
|------|---------------------|-----------------|------------------|-----------------------------------|------------------------|--------------------|
| 1    | JSON body           | admin           | agro123          | (ninguno)                         | No                     | 200, "Login correcto", token definido |
| 2    | JSON body           | admin1          | agro123          | (ninguno)                         | No                     | 401, "Credenciales inválidas"        |
| 3    | JSON body           | admin           | wrongpassword    | (ninguno)                         | No                     | 401, "Credenciales inválidas"        |
| 4    | Basic Auth          | (no body)       | (no body)        | Basic YWRtaW46YWdybzEyMw==        | No                     | 200, "Login correcto"                 |
| 5    | JSON body           | admin           | agro123          | (ninguno)                         | No                     | 200, "Login correcto" (igual que caso 1) |
| 6    | JSON body           | ""              | ""               | (ninguno)                         | Sí                     | 401, "Credenciales inválidas"        |



### Tabla de decisiones: /api/protected (middleware protectRoute)

| Caso | X-API-Key enviada      | Authorization (Bearer)       | ¿Alguna credencial válida? | Resultado esperado |
|------|------------------------|------------------------------|----------------------------|--------------------|
| 7    | invalid-api-key        | (ninguno)                    | No                         | 401, "No autorizado. Usa token Bearer o API key válida." |
| 8    | (ninguno)              | Bearer invalid-token         | No                         | 401, "No autorizado. Usa token Bearer o API key válida." |


