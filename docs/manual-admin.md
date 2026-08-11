# Manual de Administrador — GeoAlerta Global (Centro de Mando)

## ¿Qué es el Centro de Mando?

El Centro de Mando es el panel administrativo de GeoAlerta Global. Desde aquí puedes monitorear en tiempo real la ubicación y estado de todo el personal de FUNDIVEL, recibir señales SOS, coordinar respuestas de emergencia y generar reportes para equipos de rescate.

**URL de acceso:** `https://geoalerta-global-admin.vercel.app`
(En producción: `https://admin.geoalerta.fundivel.org`)

---

## 1. Acceso al Panel

### Primer ingreso
1. Abre la URL del panel admin en tu navegador (desktop recomendado)
2. Inicia sesión con tu correo y contraseña de administrador
3. Si tienes 2FA activado, ingresa el código de tu app de autenticación (Google Authenticator)

### Credenciales
Tu cuenta debe tener rol de **"admin"** o **"operador"**. Si no tienes acceso, contacta al administrador principal de FUNDIVEL.

---

## 2. Dashboard Principal

Al ingresar verás:

### Resumen Ejecutivo (tarjetas superiores)
| Indicador | Significado |
|-----------|-------------|
| **Personal Total** | Miembros registrados en la plataforma |
| **GPS Activo** | Miembros con geolocalización activa |
| **En Zona de Riesgo** | Personal dentro de un radio de afectación sísmica activo |
| **Sin contacto 15min** | Miembros que no reportan hace más de 15 minutos |
| **SOS Activos** | Señales SOS sin resolver |
| **Balizas Activas** | Dispositivos en Modo Baliza (posible atrapamiento) |

### Mapa Vectorial
El mapa muestra la ubicación de todo el personal con marcadores de color:

| Color | Estado | Acción |
|-------|--------|--------|
| 🟢 **Verde** | Seguro — check-in confirmado | Ninguna |
| 🔴 **Rojo** | SOS activo o Baliza activa | ¡PRIORIDAD! Coordinar rescate |
| 🟠 **Naranja** | En zona de impacto sin responder | Contactar urgente |
| ⚪ **Gris** | Sin señal / sin geolocalización | Verificar por otros medios |

---

## 3. Gestión de Personal

### Ver lista de miembros
- Menú lateral → **Personal**
- Se muestra: nombre, correo, estado, último contacto, batería, zona de riesgo

### Filtros disponibles
- **Por estado:** Seguro, Sin respuesta, SOS, Sin señal
- **Por zona de riesgo:** Roja, Naranja, Amarilla
- **Por tiempo sin contacto:** <5 min, <15 min, <1 hora, sin contacto
- **Búsqueda:** por nombre o correo

### Detalle de un miembro
Haz clic en cualquier persona para ver:
- Historial de ubicaciones (últimas 24 horas)
- Historial de check-ins
- Nivel de batería actual
- Tiempo desde último contacto
- Zona de riesgo actual

---

## 4. Invitar nuevo personal

1. Menú lateral → **Personal** → **Invitar**
2. Opciones:
   - **Por correo:** Ingresa el email → se envía invitación directa
   - **Por enlace:** Genera un link para compartir por WhatsApp o email
3. Selecciona el rol: personal, operador o admin
4. El invitado recibirá un enlace para registrarse

### Revocar acceso
1. Busca al miembro en la lista
2. Haz clic en su perfil → **Dar de baja**
3. El usuario pierde acceso inmediato a la plataforma

---

## 5. Eventos Sísmicos

### Monitoreo automático
El sistema consume datos de 4 fuentes sísmicas en tiempo real:
- **USGS** (Estados Unidos)
- **OpenEEW** (IBM/Grillo)
- **EMSC** (Europa)
- **Sensores On-Device** (acelerómetros del personal)

### Estados de un evento
| Estado | Significado |
|--------|-------------|
| **No confirmado** | 1 sola fuente reportó — pendiente de correlación |
| **Confirmado** | 2+ fuentes correlacionaron — alertas disparadas |
| **Descartado** | Falso positivo o sin correlación después de 30s |

### Cuando se confirma un evento
1. El sistema calcula automáticamente el radio de afectación
2. Identifica personal en zona de riesgo (Roja, Naranja, Amarilla)
3. Envía alertas a todo el personal afectado (<500ms)
4. Aparece la capa de calor (heatmap) en el mapa
5. Se activa el check-in automático para el personal en zona

### Estado de fuentes sísmicas
- Menú → **Configuración** → **Fuentes Sísmicas**
- Muestra: nombre, protocolo, estado (activa/degradada/offline), latencia

---

## 6. Alertas y Notificaciones

### Cascada de notificaciones (automática)
Cuando hay un sismo confirmado, el sistema envía alertas al personal en este orden:

1. **WebSocket** (instantáneo) — si están conectados
2. **Web Push** (1-2 segundos) — notificación urgente
3. **SMS** (si push no llega en 5s) — vía Twilio
4. **WhatsApp/Telegram** (si SMS falla en 15s) — canal terciario

Si todas fallan → el usuario aparece como **"no alcanzado"** en tu panel.

### Notificaciones al administrador
Recibirás alertas sonoras y visuales cuando:
- Un miembro active SOS
- Un dispositivo entre en Modo Baliza
- Un miembro esté "Sin respuesta" por más de 15 minutos
- Se confirme un evento sísmico en zona de tu personal
- Todas las fuentes sísmicas estén degradadas

---

## 7. Señales SOS y Modo Baliza

### Cuando recibes un SOS
1. Aparece una notificación roja urgente en tu panel
2. El mapa centra en la ubicación del miembro
3. Datos disponibles: GPS, nivel de batería, hora de activación

### Acciones recomendadas
1. Intenta contactar al miembro (llamada, WhatsApp)
2. Si no responde → considerar como emergencia
3. Coordina con equipos de rescate locales
4. Exporta reporte SAR con la ubicación del miembro

### Modo Baliza activa
Si un dispositivo entra en Modo Baliza:
- El marcador en el mapa se vuelve ROJO parpadeante
- Indica posible atrapamiento bajo escombros
- La baliza emite señales sonoras y Bluetooth que los rescatistas pueden detectar
- La última ubicación GPS conocida es la referencia para búsqueda

---

## 8. Reportes SAR (Búsqueda y Rescate)

### Generar reporte
1. Menú → **Reportes SAR** → **Generar**
2. Selecciona el evento sísmico
3. Filtra por zona de riesgo y/o estado de check-in
4. Elige formato: **PDF** o **CSV**
5. Clic en **"Exportar"** (se genera en menos de 10 segundos)

### Contenido del reporte
- Lista de personal afectado
- Última ubicación conocida (coordenadas + dirección textual)
- Estado reportado (check-in)
- Tiempo desde último contacto
- Nivel de batería del dispositivo
- Zona de riesgo asignada

### Uso del reporte
- Entregar a equipos de bomberos/protección civil
- Priorizar búsqueda por zona roja → naranja → amarilla
- Los que tienen SOS/Baliza activa van primero

---

## 9. Protocolo de Acción ante Sismo

### Antes del evento
- Verificar que todo el personal tenga la app instalada y GPS activo
- Revisar que las fuentes sísmicas estén activas (panel de configuración)
- Mantener actualizada la lista de personal

### Durante el evento (0-5 minutos)
1. El sistema envía alertas automáticamente
2. Monitoreá el mapa — marcadores cambiarán de color
3. Esperá los check-ins del personal (llegan en los primeros 5 minutos)

### Después del evento (5-30 minutos)
1. Revisa quién NO respondió al check-in (marcadores naranjas)
2. Intenta contactar a los "sin respuesta" por teléfono
3. Monitorea SOS y Balizas activas (marcadores rojos)
4. Genera reporte SAR si hay personal no localizado
5. Coordina con autoridades locales si es necesario

### Después del evento (30 min - 72 horas)
1. Sigue monitoreando balizas activas (pueden durar hasta 72h con batería)
2. Actualiza estados conforme se localiza al personal
3. Marca SOS como "resuelto" cuando la persona es encontrada
4. Genera reporte final para documentación

---

## 10. Configuración

### Configuración general
- **Organización:** Nombre, plan, límite de usuarios
- **Fuentes sísmicas:** Estado y latencia de cada fuente
- **Notificaciones:** Canales activos (Push, SMS, WhatsApp)

### Configuración de 2FA (recomendado)
1. Ve a **Configuración** → **Seguridad**
2. Escanea el código QR con Google Authenticator
3. Ingresa el código para confirmar
4. A partir de ahora necesitarás el código al iniciar sesión

---

## 11. Solución de problemas

| Problema | Solución |
|----------|----------|
| Mapa no carga | Verificar token de Mapbox en configuración |
| Personal no aparece en mapa | Verificar que tienen GPS activo y permisos otorgados |
| Alertas no llegan | Verificar canales de notificación (Push/SMS configurados) |
| Fuente sísmica degradada | Revisar conexión del servidor, la fuente puede estar en mantenimiento |
| SOS no se resuelve | Contactar al miembro directamente; si no responde, activar protocolo SAR |

---

## 12. Contacto técnico

Para soporte técnico de la plataforma:
- Email del equipo de desarrollo
- Repositorio: github.com/fundivel-beep/geoalerta-global
- Panel de Vercel: vercel.com/fundivel1

---

## Resumen rápido de acciones

```
SISMO DETECTADO
     ↓
Alertas enviadas automáticamente
     ↓
Esperar check-ins (5 min)
     ↓
Revisar "sin respuesta" (naranja)
     ↓
Contactar por teléfono
     ↓
¿SOS o Baliza activa? → Coordinar rescate
     ↓
Generar reporte SAR → Entregar a autoridades
     ↓
Monitorear balizas hasta resolución (72h)
```
