import { useState, useEffect } from 'react';
import { Search, DollarSign, Eye, Check, X, Download, AlertCircle, CheckCircle2, XCircle, Calendar, BarChart3, User, FileText, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { StyledSelect } from '../../components/StyledSelect';

const API_BASE = 'http://localhost:3000';

interface Pago {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  metodo_pago: string;
  numero_comprobante: string | null;
  banco_comprobante: string | null;
  fecha_transferencia: string | null;
  estado: 'pendiente' | 'pagado' | 'verificado' | 'vencido';
  observaciones: string | null;
  verificado_por: number | null;
  fecha_verificacion: string | null;
  admin_nombre?: string;
  admin_identificacion?: string;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cedula: string;
  curso_nombre: string;
  codigo_matricula: string;
  id_curso: number;
}

interface EstudianteAgrupado {
  estudiante_cedula: string;
  estudiante_nombre: string;
  estudiante_apellido: string;
  cursos: {
    id_curso: number;
    curso_nombre: string;
    codigo_matricula: string;
    pagos: Pago[];
  }[];
}

const GestionPagosEstudiante = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteAgrupado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [pagoARechazar, setPagoARechazar] = useState<Pago | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [pagoAVerificar, setPagoAVerificar] = useState<Pago | null>(null);
  const [cuotasAVerificar, setCuotasAVerificar] = useState<number[]>([]);
  
  // Estados para selectores por tarjeta
  const [selectedCurso, setSelectedCurso] = useState<{[key: string]: number}>({});
  const [selectedCuota, setSelectedCuota] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') {
        params.set('estado', filtroEstado);
      }
      params.set('limit', '200');
      
      const res = await fetch(`${API_BASE}/api/admin/pagos?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Error cargando pagos');
      
      const data = await res.json();
      setPagos(data);
      
      // Agrupar por estudiante
      const agrupados = agruparPorEstudiante(data);
      setEstudiantes(agrupados);
      
      // Inicializar selectores con primer curso y primera cuota
      const initCursos: {[key: string]: number} = {};
      const initCuotas: {[key: string]: number} = {};
      agrupados.forEach(est => {
        if (est.cursos.length > 0) {
          initCursos[est.estudiante_cedula] = est.cursos[0].id_curso;
          if (est.cursos[0].pagos.length > 0) {
            initCuotas[est.estudiante_cedula] = est.cursos[0].pagos[0].id_pago;
          }
        }
      });
      setSelectedCurso(initCursos);
      setSelectedCuota(initCuotas);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos de pagos', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const agruparPorEstudiante = (pagosData: Pago[]): EstudianteAgrupado[] => {
    const grupos: {[key: string]: EstudianteAgrupado} = {};
    
    pagosData.forEach(pago => {
      const cedula = pago.estudiante_cedula;
      
      if (!grupos[cedula]) {
        grupos[cedula] = {
          estudiante_cedula: cedula,
          estudiante_nombre: pago.estudiante_nombre,
          estudiante_apellido: pago.estudiante_apellido,
          cursos: []
        };
      }
      
      let curso = grupos[cedula].cursos.find(c => c.id_curso === pago.id_curso);
      if (!curso) {
        curso = {
          id_curso: pago.id_curso,
          curso_nombre: pago.curso_nombre,
          codigo_matricula: pago.codigo_matricula,
          pagos: []
        };
        grupos[cedula].cursos.push(curso);
      }
      
      curso.pagos.push(pago);
    });
    
    // Ordenar pagos por número de cuota
    Object.values(grupos).forEach(est => {
      est.cursos.forEach(curso => {
        curso.pagos.sort((a, b) => a.numero_cuota - b.numero_cuota);
      });
    });
    
    return Object.values(grupos);
  };

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const openComprobanteModal = (pago: Pago) => {
    const url = `${API_BASE}/api/admin/pagos/${pago.id_pago}/comprobante`;
    setComprobanteUrl(url);
    setComprobanteNumero(pago.numero_comprobante || 'N/A');
    setShowComprobanteModal(true);
  };

  const handleVerificarPago = (pago: Pago) => {
    setPagoAVerificar(pago);
    setCuotasAVerificar([pago.id_pago]); // Por defecto solo la cuota actual
    setShowVerificacionModal(true);
  };

  const confirmarVerificacion = async () => {
    if (!pagoAVerificar || cuotasAVerificar.length === 0) return;
    
    try {
      setProcesando(true);
      const token = sessionStorage.getItem('auth_token');
      const id_usuario = 1; // TODO: Obtener del contexto
      
      // Verificar todas las cuotas seleccionadas
      for (const id_pago of cuotasAVerificar) {
        const res = await fetch(`${API_BASE}/api/admin/pagos/${id_pago}/verificar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ verificado_por: id_usuario })
        });
        
        if (!res.ok) throw new Error(`Error verificando pago ${id_pago}`);
      }
      
      setShowVerificacionModal(false);
      setPagoAVerificar(null);
      setCuotasAVerificar([]);
      await loadData();
      
      toast.success(`${cuotasAVerificar.length} cuota(s) verificada(s) exitosamente`, {
        duration: 4000,
        icon: <CheckCircle2 size={20} />,
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error verificando los pagos', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazarPago = (pago: Pago) => {
    setPagoARechazar(pago);
    setMotivoRechazo('');
    setShowRechazoModal(true);
  };

  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      toast.error('Por favor ingrese el motivo del rechazo', {
        icon: <AlertCircle size={20} />,
      });
      return;
    }

    if (!pagoARechazar) return;
    
    try {
      setProcesando(true);
      const token = sessionStorage.getItem('auth_token');
      const id_usuario = 1; // TODO: Obtener del contexto
      
      const res = await fetch(`${API_BASE}/api/admin/pagos/${pagoARechazar.id_pago}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ observaciones: motivoRechazo, verificado_por: id_usuario })
      });
      
      if (!res.ok) throw new Error('Error rechazando pago');
      
      setShowRechazoModal(false);
      setPagoARechazar(null);
      setMotivoRechazo('');
      await loadData();
      
      toast.success('Pago rechazado correctamente', {
        icon: <XCircle size={20} />,
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error rechazando el pago', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setProcesando(false);
    }
  };

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchSearch = 
      est.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.estudiante_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.estudiante_cedula.includes(searchTerm);

    return matchSearch;
  });
  
  // Obtener el pago seleccionado para un estudiante
  const getPagoSeleccionado = (cedula: string): Pago | null => {
    const idCuota = selectedCuota[cedula];
    if (!idCuota) return null;
    return pagos.find(p => p.id_pago === idCuota) || null;
  };
  
  // Obtener el curso seleccionado para un estudiante
  const getCursoSeleccionado = (estudiante: EstudianteAgrupado) => {
    const idCurso = selectedCurso[estudiante.estudiante_cedula];
    return estudiante.cursos.find(c => c.id_curso === idCurso) || estudiante.cursos[0];
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(239, 68, 68, 0.2)', 
            borderTop: '4px solid #ef4444', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px'
        }}>
          <DollarSign size={32} color="#ef4444" />
          Gestión de Pagos Mensuales
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Verifica y administra los pagos mensuales de los estudiantes
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Buscar por estudiante, cédula, curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <StyledSelect
              name="filterEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos los estados' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'pagado', label: 'Pagados' },
                { value: 'verificado', label: 'Verificados' },
                { value: 'vencido', label: 'Vencidos' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Lista de estudiantes - UNA TARJETA POR ESTUDIANTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {estudiantesFiltrados.map((estudiante) => {
          const cursoActual = getCursoSeleccionado(estudiante);
          const pago = getPagoSeleccionado(estudiante.estudiante_cedula);
          
          if (!pago || !cursoActual) return null;
          
          return (
          <div
            key={pago.id_pago}
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Información Principal */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0' }}>
                {pago.estudiante_nombre} {pago.estudiante_apellido}
              </h3>
              
              {/* Primera fila - Información básica con selectores */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Identificación</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{estudiante.estudiante_cedula}</div>
                </div>
                
                {/* Selector de Curso */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Curso</div>
                  {estudiante.cursos.length > 1 ? (
                    <select
                      value={selectedCurso[estudiante.estudiante_cedula] || cursoActual.id_curso}
                      onChange={(e) => {
                        const newIdCurso = Number(e.target.value);
                        setSelectedCurso({...selectedCurso, [estudiante.estudiante_cedula]: newIdCurso});
                        const nuevoCurso = estudiante.cursos.find(c => c.id_curso === newIdCurso);
                        if (nuevoCurso && nuevoCurso.pagos.length > 0) {
                          setSelectedCuota({...selectedCuota, [estudiante.estudiante_cedula]: nuevoCurso.pagos[0].id_pago});
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {estudiante.cursos.map(curso => (
                        <option key={curso.id_curso} value={curso.id_curso} style={{ background: '#1a1a2e' }}>
                          {curso.curso_nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{cursoActual.curso_nombre}</div>
                  )}
                </div>
                
                {/* Selector de Cuota */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Cuota</div>
                  <select
                    value={selectedCuota[estudiante.estudiante_cedula] || (() => {
                      // Buscar la primera cuota que NO esté verificada (pagado, pendiente o vencido)
                      const cuotaNoVerificada = cursoActual.pagos.find((p: Pago) => p.estado !== 'verificado');
                      return cuotaNoVerificada?.id_pago || pago.id_pago;
                    })()}
                    onChange={(e) => {
                      setSelectedCuota({...selectedCuota, [estudiante.estudiante_cedula]: Number(e.target.value)});
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    {cursoActual.pagos.map(p => (
                      <option key={p.id_pago} value={p.id_pago} style={{ background: '#1a1a2e' }}>
                        Cuota #{p.numero_cuota} - {formatearMonto(p.monto)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Vencimiento</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{formatearFecha(pago.fecha_vencimiento)}</div>
                </div>
              </div>

              {/* Segunda fila - Número, Comprobante y Estado */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: pago.metodo_pago === 'efectivo' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', 
                gap: '12px',
                alignItems: 'start'
              }}>
                {/* Número de comprobante */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Número Comprobante</div>
                  {pago.numero_comprobante ? (
                    <div style={{
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      width: '100%'
                    }}>
                      {pago.numero_comprobante}
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(107, 114, 128, 0.1)',
                      border: '1px solid rgba(107, 114, 128, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      width: '100%'
                    }}>
                      Sin número
                    </div>
                  )}
                </div>

                {/* Recibido por - Solo para efectivo */}
                {pago.metodo_pago === 'efectivo' && (
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Recibido por</div>
                    {(pago as any).recibido_por ? (
                      <div style={{
                        background: 'rgba(180, 83, 9, 0.1)',
                        border: '1px solid rgba(180, 83, 9, 0.3)',
                        color: '#b45309',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        {(pago as any).recibido_por}
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(107, 114, 128, 0.1)',
                        border: '1px solid rgba(107, 114, 128, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        width: '100%'
                      }}>
                        Sin registro
                      </div>
                    )}
                  </div>
                )}

                {/* Comprobante - Botón */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Comprobante</div>
                  <button
                    onClick={() => openComprobanteModal(pago)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Download size={14} />
                    Ver Comprobante
                  </button>
                </div>

                {/* Estado */}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Estado</div>
                  <div style={{ 
                    display: 'flex',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: pago.estado === 'verificado' ? 'rgba(16, 185, 129, 0.15)' :
                               pago.estado === 'pagado' ? 'rgba(251, 191, 36, 0.15)' :
                               pago.estado === 'vencido' ? 'rgba(239, 68, 68, 0.15)' :
                               'rgba(156, 163, 175, 0.15)',
                    border: pago.estado === 'verificado' ? '1px solid rgba(16, 185, 129, 0.3)' :
                           pago.estado === 'pagado' ? '1px solid rgba(251, 191, 36, 0.3)' :
                           pago.estado === 'vencido' ? '1px solid rgba(239, 68, 68, 0.3)' :
                           '1px solid rgba(156, 163, 175, 0.3)',
                    color: pago.estado === 'verificado' ? '#10b981' :
                          pago.estado === 'pagado' ? '#fbbf24' :
                          pago.estado === 'vencido' ? '#ef4444' :
                          '#9ca3af'
                  }}>
                    {pago.estado}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción - Parte Inferior */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '16px'
            }}>
              <button 
                onClick={() => {
                  setSelectedPago(pago);
                  setShowModal(true);
                }}
                style={{ 
                  background: 'rgba(59, 130, 246, 0.15)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)', 
                  color: '#3b82f6', 
                  padding: '10px 16px', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <Eye size={16} />
                Ver
              </button>
              {pago.estado === 'pagado' && (
                <>
                  <button 
                    onClick={() => handleVerificarPago(pago)}
                    disabled={procesando}
                    style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      border: '1px solid rgba(16, 185, 129, 0.3)', 
                      color: '#10b981', 
                      padding: '10px 16px', 
                      borderRadius: '10px', 
                      cursor: procesando ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: procesando ? 0.6 : 1,
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    <Check size={16} />
                    Aprobar
                  </button>
                  <button 
                    onClick={() => handleRechazarPago(pago)}
                    disabled={procesando}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)', 
                      color: '#ef4444', 
                      padding: '10px 16px', 
                      borderRadius: '10px', 
                      cursor: procesando ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: procesando ? 0.6 : 1,
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    <X size={16} />
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
          );
        })}
      </div>


      {/* Modal de detalle PREMIUM */}
      {showModal && selectedPago && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '60px 20px 20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15,15,15,0.98) 0%, rgba(30,30,30,0.98) 100%)',
            borderRadius: '24px',
            padding: '0',
            maxWidth: '900px',
            width: '100%',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            overflow: 'hidden',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(239, 68, 68, 0.2)'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '28px 32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '12px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Download size={24} color="#fff" />
                    </div>
                    <div>
                      <h2 style={{ 
                        color: '#fff', 
                        margin: 0, 
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        letterSpacing: '-0.5px'
                      }}>
                        Detalle del Pago
                      </h2>
                      <p style={{ 
                        color: '#fbbf24', 
                        margin: '4px 0 0 0', 
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}>
                        Cuota #{selectedPago.numero_cuota}
                      </p>
                    </div>
                  </div>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    margin: '8px 0 0 0', 
                    fontSize: '0.9rem',
                    maxWidth: '600px'
                  }}>
                    Información detallada y completa de la transacción del estudiante
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Content Premium */}
            <div style={{ padding: '32px' }}>
              {/* Stats Cards Row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px',
                marginBottom: '28px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(20px)'
                  }} />
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '8px'
                  }}>
                    <DollarSign size={16} style={{ display: 'inline', marginRight: '4px' }} /> Monto
                  </div>
                  <div style={{ 
                    color: '#10b981', 
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '-1px'
                  }}>
                    {formatearMonto(selectedPago.monto)}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(20px)'
                  }} />
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '8px'
                  }}>
                    <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} /> Cuota
                  </div>
                  <div style={{ 
                    color: '#3b82f6', 
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'monospace'
                  }}>
                    #{selectedPago.numero_cuota}
                  </div>
                </div>

                <div style={{
                  background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                    : selectedPago.estado === 'pendiente'
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado'
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : selectedPago.estado === 'pendiente'
                    ? '1px solid rgba(251, 191, 36, 0.2)'
                    : '1px solid rgba(239, 68, 68, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px'
                  }}>
                    <BarChart3 size={16} style={{ display: 'inline', marginRight: '4px' }} /> Estado
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.2)' : 
                               selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.2)' : 
                               'rgba(239, 68, 68, 0.2)',
                    color: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '#10b981' : 
                          selectedPago.estado === 'pendiente' ? '#fbbf24' : '#ef4444',
                    boxShadow: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '0 4px 12px rgba(16, 185, 129, 0.2)' :
                              selectedPago.estado === 'pendiente' ? '0 4px 12px rgba(251, 191, 36, 0.2)' :
                              '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}>
                    {selectedPago.estado === 'verificado' ? '✓ ' : selectedPago.estado === 'pagado' ? '✓ ' : selectedPago.estado === 'pendiente' ? '⏱ ' : '✗ '}
                    {selectedPago.estado}
                  </span>
                </div>
              </div>

              {/* Información Detallada */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '16px',
                marginBottom: '24px'
              }}>
                {/* Estudiante Card */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#fff',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                    }}>
                      {selectedPago.estudiante_nombre?.charAt(0)}{selectedPago.estudiante_apellido?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.5)', 
                        fontSize: '0.7rem', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '6px'
                      }}>
                        <User size={16} style={{ display: 'inline', marginRight: '4px' }} /> Estudiante
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {selectedPago.estudiante_nombre} {selectedPago.estudiante_apellido}
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          color: '#fbbf24',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          ID: {selectedPago.estudiante_cedula}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Curso Card */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px'
                  }}>
                    <BookOpen size={16} style={{ display: 'inline', marginRight: '4px' }} /> Curso Matriculado
                  </div>
                  <div style={{ 
                    color: '#fff', 
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.9rem'
                    }}>
                      {selectedPago.curso_nombre}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Pago - Solo para efectivo */}
              {selectedPago.metodo_pago === 'efectivo' && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid rgba(180, 83, 9, 0.3)'
                }}>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '16px'
                  }}>
                    💰 Información del Pago en Efectivo
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '16px'
                  }}>
                    {selectedPago.numero_comprobante && (
                      <div>
                        <div style={{ 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '0.75rem',
                          marginBottom: '6px'
                        }}>
                          Número de Comprobante
                        </div>
                        <div style={{ 
                          color: '#fbbf24', 
                          fontSize: '1rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          background: 'rgba(251, 191, 36, 0.1)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(251, 191, 36, 0.3)'
                        }}>
                          {selectedPago.numero_comprobante}
                        </div>
                      </div>
                    )}
                    {(selectedPago as any).recibido_por && (
                      <div>
                        <div style={{ 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '0.75rem',
                          marginBottom: '6px'
                        }}>
                          Recibido por
                        </div>
                        <div style={{ 
                          color: '#b45309', 
                          fontSize: '1rem',
                          fontWeight: 700,
                          background: 'rgba(180, 83, 9, 0.1)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(180, 83, 9, 0.3)'
                        }}>
                          {(selectedPago as any).recibido_por}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de Verificación */}
              {(selectedPago.estado === 'verificado' && selectedPago.fecha_verificacion) && (
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)', 
                  border: '1px solid rgba(16, 185, 129, 0.3)', 
                  borderRadius: '16px', 
                  padding: '20px',
                  marginBottom: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }} />
                  <div style={{ 
                    color: '#10b981', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ✓ Verificado por Administrador
                  </div>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.95)', 
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {selectedPago.admin_nombre || 'Administrador'}
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        marginBottom: '6px'
                      }}>
                        ID: {selectedPago.admin_identificacion || selectedPago.verificado_por || 'N/A'}
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        fontSize: '0.8rem',
                        fontFamily: 'monospace'
                      }}>
                        {new Date(selectedPago.fecha_verificacion).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {selectedPago.observaciones && (
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', 
                  border: '1px solid rgba(251, 191, 36, 0.3)', 
                  borderRadius: '16px', 
                  padding: '20px',
                  marginBottom: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }} />
                  <div style={{ 
                    color: '#fbbf24', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileText size={18} style={{ display: 'inline', marginRight: '6px' }} /> Observaciones Importantes
                  </div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.95)', 
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    fontWeight: 500
                  }}>
                    {selectedPago.observaciones}
                  </div>
                </div>
              )}

              {/* Actions Premium */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                  }}
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {showComprobanteModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)', 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center', 
          zIndex: 60,
          padding: '40px 20px',
          paddingTop: '80px'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 16, 
            width: 'min(90vw, 800px)', 
            maxHeight: 'calc(100vh - 160px)',
            padding: 24, 
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={20} />
                  Comprobante de Pago
                </h3>
                {comprobanteNumero && (
                  <p style={{ 
                    margin: '4px 0 0 28px', 
                    color: '#fbbf24', 
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>
                    Número de Comprobante: {comprobanteNumero}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowComprobanteModal(false)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px',
              overflow: 'hidden'
            }}>
              <img 
                src={comprobanteUrl} 
                alt="Comprobante de pago"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = `
                    <div style="text-align: center; color: rgba(255,255,255,0.7);">
                      <p>No se pudo cargar la imagen del comprobante</p>
                      <a href="${comprobanteUrl}" target="_blank" style="color: #10b981; text-decoration: underline;">
                        Abrir en nueva pestaña
                      </a>
                    </div>
                  `;
                  (e.target as HTMLImageElement).parentNode?.appendChild(errorDiv);
                }}
              />
            </div>
            
            <div style={{ 
              marginTop: '16px', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px' 
            }}>
              <a 
                href={comprobanteUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <Download size={16} />
                Descargar
              </a>
              <button
                onClick={() => setShowComprobanteModal(false)}
                style={{
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  color: '#9ca3af',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Verificación Inteligente */}
      {showVerificacionModal && pagoAVerificar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px 20px',
          paddingTop: '80px',
          overflow: 'auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Check size={32} color="#10b981" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px 0' }}>
                Verificar Pago
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                {pagoAVerificar.estudiante_nombre} {pagoAVerificar.estudiante_apellido}
              </p>
            </div>

            {/* Información del pago */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'grid', gap: '8px', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monto total pagado:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>
                    {(() => {
                      const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                      const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                      const cuotasPagadas = cursoActual?.pagos.filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado') || [];
                      const montoTotal = cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.monto.toString()), 0);
                      return formatearMonto(montoTotal);
                    })()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cuotas cubiertas:</span>
                  <strong>
                    {(() => {
                      const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                      const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                      const cuotasPagadas = cursoActual?.pagos.filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado') || [];
                      return `${cuotasPagadas.length} cuota(s) de $${pagoAVerificar.monto} c/u`;
                    })()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Comprobante:</span>
                  <strong>{pagoAVerificar.numero_comprobante || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Primera cuota:</span>
                  <strong>#{pagoAVerificar.numero_cuota}</strong>
                </div>
              </div>
            </div>

            {/* Selección de cuotas */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px' }}>
                ¿Cuántas cuotas desea verificar con este pago?
              </label>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                {(() => {
                  const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                  const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                  // Solo mostrar cuotas en estado "pagado" que se pueden verificar
                  const cuotasDisponibles = cursoActual?.pagos
                    .filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado')
                    .sort((a, b) => a.numero_cuota - b.numero_cuota) || [];
                  
                  if (cuotasDisponibles.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.7)' }}>
                        Solo la cuota actual está disponible para verificar
                      </div>
                    );
                  }
                  
                  return cuotasDisponibles.map((cuota) => (
                    <label key={cuota.id_pago} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: cuotasAVerificar.includes(cuota.id_pago) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      border: cuotasAVerificar.includes(cuota.id_pago) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={cuotasAVerificar.includes(cuota.id_pago)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCuotasAVerificar([...cuotasAVerificar, cuota.id_pago]);
                          } else {
                            setCuotasAVerificar(cuotasAVerificar.filter(id => id !== cuota.id_pago));
                          }
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, color: '#fff' }}>
                        <div style={{ fontWeight: '600' }}>Cuota #{cuota.numero_cuota}</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                          {formatearMonto(cuota.monto)} - {cuota.estado}
                        </div>
                      </div>
                    </label>
                  ));
                })()}
              </div>
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                  Total a verificar: {cuotasAVerificar.length} cuota(s)
                </div>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowVerificacionModal(false);
                  setPagoAVerificar(null);
                  setCuotasAVerificar([]);
                }}
                disabled={procesando}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '12px',
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  opacity: procesando ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVerificacion}
                disabled={procesando || cuotasAVerificar.length === 0}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: procesando || cuotasAVerificar.length === 0
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando || cuotasAVerificar.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: procesando || cuotasAVerificar.length === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {procesando ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Verificar {cuotasAVerificar.length > 1 ? `${cuotasAVerificar.length} Cuotas` : 'Cuota'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo Elegante */}
      {showRechazoModal && pagoARechazar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px 20px',
          paddingTop: '80px',
          overflow: 'auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Header del modal */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <X size={32} color="#ef4444" />
              </div>
              <h3 style={{ 
                color: '#fff', 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: '0 0 8px 0' 
              }}>
                Rechazar Pago
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.9rem', 
                margin: 0 
              }}>
                Cuota #{pagoARechazar.numero_cuota} - {pagoARechazar.estudiante_nombre} {pagoARechazar.estudiante_apellido}
              </p>
            </div>

            {/* Información del pago */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> Al rechazar este pago:
              </div>
              <ul style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '0.85rem', 
                margin: 0, 
                paddingLeft: '20px' 
              }}>
                <li>El estado volverá a "Pendiente"</li>
                <li>El estudiante deberá subir un nuevo comprobante</li>
                <li>Se le notificará el motivo del rechazo</li>
              </ul>
            </div>

            {/* Campo de motivo */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                color: '#fff', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                marginBottom: '8px' 
              }}>
                Motivo del rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej: El comprobante no es legible, número incorrecto, etc."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
              <div style={{ 
                color: 'rgba(255,255,255,0.5)', 
                fontSize: '0.75rem', 
                marginTop: '4px' 
              }}>
                Este mensaje será visible para el estudiante
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowRechazoModal(false);
                  setPagoARechazar(null);
                  setMotivoRechazo('');
                }}
                disabled={procesando}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '12px',
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  opacity: procesando ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                disabled={procesando || !motivoRechazo.trim()}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: procesando || !motivoRechazo.trim() 
                    ? 'rgba(239, 68, 68, 0.3)' 
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando || !motivoRechazo.trim() ? 'not-allowed' : 'pointer',
                  opacity: procesando || !motivoRechazo.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {procesando ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <X size={18} />
                    Rechazar Pago
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GestionPagosEstudiante;
