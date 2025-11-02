# LoadingModal - Componente de Carga Reutilizable

## 📋 Descripción
Componente modal que muestra un indicador de carga con animación, mensaje personalizable y recarga automática de datos. Elimina la necesidad de hacer Ctrl+R para ver datos actualizados.

## 🎯 Características
- ✅ Animación de spinner suave
- ✅ Barra de progreso animada
- ✅ Adaptable a modo claro/oscuro
- ✅ Duración configurable
- ✅ Callback al completar
- ✅ Estilos consistentes con el sistema

## 📦 Importación
```typescript
import LoadingModal from '../../components/LoadingModal';
```

## 🔧 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | **Requerido**. Controla si el modal está visible |
| `message` | `string` | `'Actualizando datos...'` | Mensaje principal a mostrar |
| `darkMode` | `boolean` | `false` | Activa el tema oscuro |
| `duration` | `number` | `2000` | Duración en milisegundos (0 = sin auto-cierre) |
| `onComplete` | `() => void` | - | Callback ejecutado al terminar la duración |

## 💡 Uso Básico

### 1. Agregar estado en tu componente
```typescript
const [showLoadingModal, setShowLoadingModal] = useState(false);
```

### 2. Crear función de callback
```typescript
const handleLoadingComplete = async () => {
  // Recargar datos
  await loadData();
  // Cerrar modal
  setShowLoadingModal(false);
};
```

### 3. Mostrar modal después de operación exitosa
```typescript
const guardarDatos = async () => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      toast.success('Datos guardados correctamente');
      setShowLoadingModal(true); // 👈 Mostrar modal
    }
  } catch (error) {
    toast.error('Error al guardar');
  }
};
```

### 4. Agregar componente al JSX
```typescript
return (
  <div>
    {/* Tu contenido aquí */}
    
    <LoadingModal
      isOpen={showLoadingModal}
      message="Actualizando datos"
      darkMode={darkMode}
      duration={2000}
      onComplete={handleLoadingComplete}
    />
  </div>
);
```

## 📚 Ejemplos Completos

### Ejemplo 1: Guardar Asistencia (Docente)
```typescript
const TomarAsistencia = ({ darkMode }) => {
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleLoadingComplete = async () => {
    if (cursoSeleccionado) {
      await loadAsistenciaExistente(cursoSeleccionado, fechaSeleccionada);
    }
    setShowLoadingModal(false);
  };

  const guardarAsistencia = async () => {
    // ... lógica de guardado
    if (response.ok) {
      toast.success('Asistencia guardada');
      setShowLoadingModal(true);
    }
  };

  return (
    <>
      {/* Contenido */}
      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando asistencias"
        darkMode={darkMode}
        duration={2000}
        onComplete={handleLoadingComplete}
      />
    </>
  );
};
```

### Ejemplo 2: Crear Curso (Admin)
```typescript
const GestionCursos = () => {
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleLoadingComplete = async () => {
    await loadCursos();
    setShowLoadingModal(false);
  };

  const crearCurso = async (data) => {
    const response = await fetch('/api/cursos', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      toast.success('Curso creado correctamente');
      setShowModal(false);
      setShowLoadingModal(true);
    }
  };

  return (
    <>
      {/* Contenido */}
      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando lista de cursos"
        darkMode={darkMode}
        duration={2500}
        onComplete={handleLoadingComplete}
      />
    </>
  );
};
```

### Ejemplo 3: Pago de Mensualidad (Estudiante)
```typescript
const PagosMensuales = ({ darkMode }) => {
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleLoadingComplete = async () => {
    await loadPagos();
    await loadEstadoCuenta();
    setShowLoadingModal(false);
  };

  const registrarPago = async (pagoData) => {
    const response = await fetch('/api/pagos', {
      method: 'POST',
      body: JSON.stringify(pagoData)
    });

    if (response.ok) {
      toast.success('Pago registrado correctamente');
      setShowLoadingModal(true);
    }
  };

  return (
    <>
      {/* Contenido */}
      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando estado de cuenta"
        darkMode={darkMode}
        duration={3000}
        onComplete={handleLoadingComplete}
      />
    </>
  );
};
```

## ⚙️ Configuración de Duración

### Duraciones Recomendadas por Operación

| Operación | Duración | Razón |
|-----------|----------|-------|
| Guardar registro simple | 1500-2000ms | Operación rápida |
| Actualizar lista | 2000-2500ms | Necesita refrescar datos |
| Operación compleja | 2500-3000ms | Múltiples consultas |
| Subir archivos | 3000-4000ms | Procesamiento de archivos |

### Sin Auto-cierre
```typescript
<LoadingModal
  isOpen={showLoadingModal}
  message="Procesando..."
  darkMode={darkMode}
  duration={0} // Sin auto-cierre
  onComplete={undefined} // Sin callback
/>

// Cerrar manualmente cuando termine la operación
setShowLoadingModal(false);
```

## 🎨 Personalización de Mensajes

```typescript
// Mensajes por contexto
const messages = {
  saving: 'Guardando cambios...',
  loading: 'Cargando datos...',
  updating: 'Actualizando información...',
  processing: 'Procesando solicitud...',
  uploading: 'Subiendo archivos...',
  deleting: 'Eliminando registro...',
};

<LoadingModal
  isOpen={showLoadingModal}
  message={messages.saving}
  darkMode={darkMode}
  duration={2000}
  onComplete={handleLoadingComplete}
/>
```

## 🔄 Rate Limiting

El backend ya tiene rate-limiting configurado:
- **General**: 100 requests / 15 minutos
- **Estricto**: 30 requests / minuto
- **Polling**: 10 requests / minuto

El LoadingModal ayuda a respetar estos límites al:
1. Evitar múltiples recargas manuales (Ctrl+R)
2. Controlar el timing de las peticiones
3. Dar feedback visual al usuario

## ⚠️ Notas Importantes

1. **Siempre cierra el modal**: Asegúrate de llamar `setShowLoadingModal(false)` en el callback
2. **Manejo de errores**: No muestres el modal si la operación falla
3. **Duración apropiada**: Ajusta según la complejidad de la operación
4. **Feedback al usuario**: Usa mensajes claros y descriptivos
5. **darkMode**: Pasa la prop darkMode desde el componente padre

## 🐛 Troubleshooting

### El modal no se cierra
```typescript
// ❌ Incorrecto
const handleLoadingComplete = async () => {
  await loadData();
  // Falta cerrar el modal
};

// ✅ Correcto
const handleLoadingComplete = async () => {
  await loadData();
  setShowLoadingModal(false); // 👈 Cerrar modal
};
```

### Los datos no se recargan
```typescript
// ❌ Incorrecto
const handleLoadingComplete = () => {
  setShowLoadingModal(false);
  // Falta recargar datos
};

// ✅ Correcto
const handleLoadingComplete = async () => {
  await loadData(); // 👈 Recargar primero
  setShowLoadingModal(false);
};
```

### El modal aparece en operaciones fallidas
```typescript
// ❌ Incorrecto
const guardar = async () => {
  setShowLoadingModal(true); // Se muestra siempre
  await fetch('/api/endpoint');
};

// ✅ Correcto
const guardar = async () => {
  const response = await fetch('/api/endpoint');
  if (response.ok) { // 👈 Solo si es exitoso
    setShowLoadingModal(true);
  }
};
```

## 📝 Checklist de Implementación

- [ ] Importar LoadingModal
- [ ] Agregar estado `showLoadingModal`
- [ ] Crear función `handleLoadingComplete`
- [ ] Mostrar modal solo en operaciones exitosas
- [ ] Recargar datos en el callback
- [ ] Cerrar modal al finalizar
- [ ] Pasar prop `darkMode`
- [ ] Ajustar duración según operación
- [ ] Personalizar mensaje
- [ ] Probar en modo claro y oscuro

## 🎯 Beneficios

✅ **Mejor UX**: Usuario ve feedback visual inmediato
✅ **Sin Ctrl+R**: Datos se actualizan automáticamente
✅ **Consistencia**: Mismo comportamiento en toda la app
✅ **Rate-limit friendly**: Controla el timing de peticiones
✅ **Profesional**: Animaciones suaves y diseño pulido
