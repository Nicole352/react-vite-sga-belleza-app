import React, { useState } from 'react';
import { 
  FileText, Search, RefreshCw, Download, CheckCircle, Users, AlertTriangle, 
  AlertCircle, Save, Edit3, Server, Wifi, DollarSign
} from 'lucide-react';

const LogsPanel: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1em' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1em' }}>
          <div>
            <h2 style={{
              color: 'rgba(255,255,255,0.95)',
              margin: '0 0 0.375rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '1.625rem',
              fontWeight: '700'
            }}>
              <FileText size={26} color="#ef4444" />
              Logs del Sistema
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontSize: '0.85rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
            }}>
              Registro completo de actividades y eventos del sistema
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              padding: '0.75em 1.25em',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.625em',
              color: '#ef4444',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <RefreshCw size={14} />
              Actualizar
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              padding: '0.75em 1.25em',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '0.625em',
              color: '#fff',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 0.25rem 0.75em rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0.25rem 0.75em rgba(16, 185, 129, 0.3)';
            }}>
              <Download size={14} />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de Logs */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(1.25rem)',
        border: '0.0625rem solid rgba(255,255,255,0.1)',
        borderRadius: '0.875em',
        padding: '1em',
        marginBottom: '1em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ flex: 1, minWidth: '17.5rem', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Buscar en logs..."
              style={{
                width: '100%',
                padding: '0.625em 0.625em 0.625em 2.375em',
                background: 'rgba(255,255,255,0.1)',
                border: '0.0625rem solid rgba(255,255,255,0.2)',
                borderRadius: '0.625em',
                color: '#fff',
                fontSize: '0.875rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Filtro por Tipo */}
          <select style={{
            padding: '0.625em 0.75em',
            background: 'rgba(255,255,255,0.1)',
            border: '0.0625rem solid rgba(255,255,255,0.2)',
            borderRadius: '0.625em',
            color: '#fff',
            fontSize: '0.875rem',
            cursor: 'pointer',
            minWidth: '12.5rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
          }}>
            <option value="all" style={{ background: '#1a1a2e', color: '#fff' }}>Todos los tipos</option>
            <option value="info" style={{ background: '#1a1a2e', color: '#fff' }}>Información</option>
            <option value="warning" style={{ background: '#1a1a2e', color: '#fff' }}>Advertencias</option>
            <option value="error" style={{ background: '#1a1a2e', color: '#fff' }}>Errores</option>
            <option value="success" style={{ background: '#1a1a2e', color: '#fff' }}>Éxito</option>
          </select>

          {/* Filtro por Fecha */}
          <input
            type="date"
            style={{
              padding: '0.625em 0.75em',
              background: 'rgba(255,255,255,0.1)',
              border: '0.0625rem solid rgba(255,255,255,0.2)',
              borderRadius: '0.625em',
              color: '#fff',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
            }}
          />
        </div>
      </div>

      {/* Lista de Logs */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(1.25rem)',
        border: '0.0625rem solid rgba(255,255,255,0.1)',
        borderRadius: '0.875em',
        overflow: 'hidden',
        boxShadow: '0 0.5em 1.5em rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header de la tabla */}
        <div style={{
          background: 'rgba(248, 113, 113, 0.15)',
          borderBottom: '0.0625rem solid rgba(248, 113, 113, 0.3)',
          padding: '1em 1.5em',
          display: 'grid',
          gridTemplateColumns: '5em 1fr 12.5rem 9.375rem 7.5rem',
          gap: '1em',
          alignItems: 'center'
        }}>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
            Tipo
          </div>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
            Mensaje
          </div>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
            Usuario/Sistema
          </div>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
            IP Address
          </div>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
            Fecha/Hora
          </div>
        </div>

        {/* Filas de logs */}
        <div>
          {[
            { type: 'success', icon: CheckCircle, color: '#10b981', message: 'Usuario autenticado correctamente', user: 'admin@instituto.edu', ip: '192.168.1.100', time: '22:35:12', date: '26/08/2025' },
            { type: 'info', icon: Users, color: '#3b82f6', message: 'Nuevo estudiante registrado en el sistema', user: 'Sistema', ip: '192.168.1.1', time: '22:30:45', date: '26/08/2025' },
            { type: 'warning', icon: AlertTriangle, color: '#f59e0b', message: 'Intento de acceso con credenciales incorrectas', user: 'usuario@test.com', ip: '192.168.1.150', time: '22:28:33', date: '26/08/2025' },
            { type: 'error', icon: AlertCircle, color: '#ef4444', message: 'Error en la conexión a la base de datos', user: 'Sistema', ip: 'localhost', time: '22:25:18', date: '26/08/2025' },
            { type: 'success', icon: Save, color: '#10b981', message: 'Backup automático completado exitosamente', user: 'Sistema', ip: 'localhost', time: '22:00:00', date: '26/08/2025' },
            { type: 'info', icon: Edit3, color: '#3b82f6', message: 'Perfil de usuario actualizado', user: 'maria.gonzalez@instituto.edu', ip: '192.168.1.120', time: '21:45:22', date: '26/08/2025' },
            { type: 'warning', icon: Server, color: '#f59e0b', message: 'Alto uso de CPU detectado (85%)', user: 'Sistema', ip: 'localhost', time: '21:30:15', date: '26/08/2025' },
            { type: 'success', icon: DollarSign, color: '#10b981', message: 'Pago procesado correctamente', user: 'carlos.ruiz@instituto.edu', ip: '192.168.1.135', time: '21:15:08', date: '26/08/2025' },
            { type: 'error', icon: Wifi, color: '#ef4444', message: 'Pérdida de conexión temporal', user: 'Sistema', ip: 'localhost', time: '21:00:45', date: '26/08/2025' },
            { type: 'info', icon: FileText, color: '#3b82f6', message: 'Nuevo curso creado: "Matemáticas Avanzadas"', user: 'prof.lopez@instituto.edu', ip: '192.168.1.110', time: '20:45:30', date: '26/08/2025' }
          ].map((log, index) => {
            const IconComponent = log.icon;
            return (
              <div
                key={index}
                style={{
                  padding: '1em 1.5em',
                  borderBottom: index < 9 ? '0.0625rem solid rgba(255,255,255,0.05)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '5em 1fr 12.5rem 9.375rem 7.5rem',
                  gap: '1em',
                  alignItems: 'center',
                  background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
                }}
              >
                {/* Tipo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '2.25em',
                    height: '2.25em',
                    borderRadius: '0.5em',
                    background: `${log.color}20`,
                    border: `0.0625rem solid ${log.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={16} color={log.color} />
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                    {log.message}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                    {log.type}
                  </div>
                </div>

                {/* Usuario */}
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', wordBreak: 'break-all', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                  {log.user}
                </div>

                {/* IP */}
                <div style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '0.25em 0.5em',
                  borderRadius: '0.375em',
                  textAlign: 'center'
                }}>
                  {log.ip}
                </div>

                {/* Fecha/Hora */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: '600', fontFamily: 'monospace' }}>
                    {log.time}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    {log.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paginación */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(1.25rem)',
        border: '0.0625rem solid rgba(255,255,255,0.1)',
        borderRadius: '0.875em',
        padding: '1em 1.5em',
        marginTop: '1em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1em'
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
          Mostrando 1-10 de 1,247 registros
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          {[1, 2, 3, '...', 125].map((page, index) => (
            <button
              key={index}
              style={{
                width: '2.25em',
                height: '2.25em',
                borderRadius: '0.5em',
                border: page === 1 ? '0.0625rem solid rgba(239, 68, 68, 0.5)' : '0.0625rem solid rgba(255,255,255,0.2)',
                background: page === 1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                color: page === 1 ? '#ef4444' : 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: page !== '...' ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}
              onMouseEnter={(e) => {
                if (page !== '...' && page !== 1) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== '...' && page !== 1) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LogsPanel;
