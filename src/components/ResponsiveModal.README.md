# ResponsiveModal Component

Componente de modal responsive que se adapta automáticamente a diferentes tamaños de pantalla.

## Características

✅ **Responsive automático**
- Desktop: Modal centrado con ancho máximo configurable
- Tablet: Modal centrado con 90% del ancho
- Móvil: Modal desliza desde abajo, ocupa 100% del ancho

✅ **Animaciones suaves**
- Desktop/Tablet: Scale in
- Móvil: Slide up desde abajo

✅ **Accesibilidad**
- Cierre con tecla ESC
- Bloqueo de scroll del body
- Overlay con blur

✅ **UX optimizada**
- Scroll interno en el contenido
- Botón de cierre visible
- Click fuera del modal para cerrar

## Uso Básico

```tsx
import ResponsiveModal from '../../components/ResponsiveModal';

function MiComponente() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Abrir Modal
      </button>

      <ResponsiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Título del Modal"
        maxWidth="600px"
      >
        {/* Contenido del modal */}
        <form>
          <input type="text" placeholder="Nombre" />
          <button type="submit">Guardar</button>
        </form>
      </ResponsiveModal>
    </>
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controla si el modal está visible |
| `onClose` | `() => void` | - | Función para cerrar el modal |
| `title` | `string` | - | Título del modal |
| `children` | `ReactNode` | - | Contenido del modal |
| `maxWidth` | `string` | `'600px'` | Ancho máximo en desktop |
| `showCloseButton` | `boolean` | `true` | Mostrar botón X de cierre |

## Ejemplos

### Modal de Formulario

```tsx
<ResponsiveModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Crear Usuario"
  maxWidth="700px"
>
  <form onSubmit={handleSubmit}>
    <div style={{ display: 'grid', gap: '16px' }}>
      <input type="text" name="nombre" placeholder="Nombre" />
      <input type="email" name="email" placeholder="Email" />
      <button type="submit">Crear</button>
    </div>
  </form>
</ResponsiveModal>
```

### Modal de Confirmación

```tsx
<ResponsiveModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="¿Estás seguro?"
  maxWidth="400px"
>
  <p>Esta acción no se puede deshacer.</p>
  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
    <button onClick={() => setShowConfirm(false)}>Cancelar</button>
    <button onClick={handleDelete}>Eliminar</button>
  </div>
</ResponsiveModal>
```

### Modal Grande con Scroll

```tsx
<ResponsiveModal
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  title="Detalles Completos"
  maxWidth="900px"
>
  <div style={{ display: 'grid', gap: '20px' }}>
    {/* Contenido largo que hará scroll automáticamente */}
    <section>...</section>
    <section>...</section>
    <section>...</section>
  </div>
</ResponsiveModal>
```

## Comportamiento Responsive

### Desktop (1025px+)
- Modal centrado en pantalla
- Ancho máximo configurable
- Animación: scale in
- Padding: 24px

### Tablet (641px - 1024px)
- Modal centrado en pantalla
- Ancho: 90vw
- Máximo: 600px
- Animación: scale in
- Padding: 20px

### Móvil (≤640px)
- Modal desde abajo (bottom sheet)
- Ancho: 100%
- Altura máxima: 90vh
- Animación: slide up
- Padding: 16px
- Border radius: 20px solo arriba
- Inputs con font-size 16px (evita zoom en iOS)

## Estilos CSS Automáticos

El componente incluye estilos CSS que también afectan a modales existentes:

```css
/* Los modales existentes también se adaptan automáticamente */
@media (max-width: 640px) {
  div[style*="position: fixed"] > div {
    width: 95vw !important;
    max-height: 85vh !important;
  }
  
  /* Grids de 2 columnas se convierten en 1 */
  form > div[style*="gridTemplateColumns"] {
    grid-template-columns: 1fr !important;
  }
}
```

## Notas

- El modal bloquea el scroll del body cuando está abierto
- Se puede cerrar con ESC, click en overlay, o botón X
- El contenido tiene scroll automático si es muy largo
- Los formularios dentro se adaptan automáticamente en móvil
