import React, { useState } from 'react';
import { 
  FileText, Search, RefreshCw, Download, CheckCircle, Users, AlertTriangle, 
  AlertCircle, Save, Edit3, Server, Wifi, DollarSign
} from 'lucide-react';

const LogsPanel: React.FC = () => {
  return (
    <div style={{
      padding: '32px',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
      minHeight: '100vh',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* Header de Logs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
            }}>
              <FileText size={40} color="#fff" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '2.2rem', 
                fontWeight: '800', 
                color: '#fff',
                margin: 0,
                background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Logs del Sistema
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                Registro completo de actividades y eventos del sistema
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              padding: '8px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <RefreshCw size={14} />
              Actualizar
            </button>
            <button style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10b981',
              padding: '8px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Download size={14} />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de Logs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar en logs..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 50px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          {/* Filtro por Tipo */}
          <select style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            cursor: 'pointer',
            minWidth: '150px'
          }}>
            <option value="all">Todos los tipos</option>
            <option value="info">Información</option>
            <option value="warning">Advertencias</option>
            <option value="error">Errores</option>
            <option value="success">Éxito</option>
          </select>

          {/* Filtro por Fecha */}
          <input
            type="date"
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Lista de Logs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header de la tabla */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: '80px 1fr 200px 150px 120px',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tipo
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Mensaje
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Usuario/Sistema
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            IP Address
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                  padding: '20px 24px',
                  borderBottom: index < 9 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 200px 150px 120px',
                  gap: '20px',
                  alignItems: 'center',
                  background: log.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 
                             log.type === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
                             log.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Tipo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${log.color}, ${log.color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${log.color}33`
                  }}>
                    <IconComponent size={18} color="#fff" />
                  </div>
                </div>

                {/* Mensaje */}
                <div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                    {log.message}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {log.type}
                  </div>
                </div>

                {/* Usuario */}
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {log.user}
                </div>

                {/* IP */}
                <div style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  {log.ip}
                </div>

                {/* Fecha/Hora */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>
                    {log.time}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
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
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Mostrando 1-10 de 1,247 registros
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[1, 2, 3, '...', 125].map((page, index) => (
            <button
              key={index}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                background: page === 1 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.1)',
                color: page === 1 ? '#fff' : 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: page !== '...' ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogsPanel;
