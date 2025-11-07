import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Flower2, Sparkles, Brush, Eye, Hand, Heart, Scissors, Crown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  options?: { label: string; action: string }[];
  showCourses?: boolean;
};

const ChatBot: React.FC = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje inicial cuando se abre el chat con saludo personalizado
      const hour = new Date().getHours();
      let greeting = '¡Hola!';
      if (hour >= 5 && hour < 12) greeting = '¡Buenos días!';
      else if (hour >= 12 && hour < 19) greeting = '¡Buenas tardes!';
      else greeting = '¡Buenas noches!';
      
      setTimeout(() => {
        addBotMessage(
          `${greeting} 👋 Soy tu asistente virtual de la Escuela Jessica Vélez. Estoy aquí para ayudarte a cumplir tus sueños. ¿Qué te gustaría saber?`,
          [
            { label: '✨ Descubre tu curso ideal', action: 'cursos' },
            { label: '📝 Inscribirme ahora', action: 'matricula' },
            { label: '💎 Inversión en tu futuro', action: 'precios' },
            { label: '💬 Hablemos personalmente', action: 'contacto' }
          ]
        );
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, options?: { label: string; action: string }[], showCourses?: boolean) => {
    setIsTyping(true);
    // Tiempo de escritura más realista basado en la longitud del mensaje
    const typingTime = Math.min(1500, 500 + text.length * 15);
    setTimeout(() => {
      setIsTyping(false);
      const newMessage: Message = {
        id: Date.now(),
        text,
        sender: 'bot',
        timestamp: new Date(),
        options,
        showCourses
      };
      setMessages(prev => [...prev, newMessage]);
    }, typingTime);
  };

  const handleOptionClick = (action: string) => {
    // Mapeo de acciones a textos del usuario
    const userTexts: { [key: string]: string } = {
      'cursos': 'Quiero descubrir mi curso ideal',
      'matricula': 'Quiero inscribirme ahora',
      'precios': 'Cuéntame sobre la inversión',
      'contacto': 'Quiero hablar con ustedes',
      'ver-cursos': 'Muéstrame todos los cursos',
      'inicio': 'Volver al inicio'
    };

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now(),
      text: userTexts[action] || 'Consulta',
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Respuesta del bot según la opción
    if (action === 'cursos' || action === 'ver-cursos') {
      addBotMessage(
        '✨ **¡Tu futuro comienza aquí!** 🌟\n\nDescubre los cursos que transformarán tu carrera profesional. Cada uno diseñado para convertirte en una experta:',
        undefined,
        true
      );
    } else if (action === 'matricula') {
      addBotMessage(
        '📝 **Inscribirme ahora**\n\n' +
        '✅ La Escuela Jessica Vélez **no cobra matrícula ni inscripción**.\n' +
        '📎 Solo debes subir un comprobante del **pago inicial** del curso elegido.\n\n' +
        'Si pagas por transferencia: sube el comprobante bancario.\n' +
        'Si te acercas a la escuela y pagas en efectivo: el personal administrativo te entregará una **factura** y esa factura debes subirla al sistema para obtener tus credenciales.\n\n' +
        '🪜 **Pasos para inscribirte:**\n' +
        '1️⃣ Ve a la sección "Cursos" y elige tu curso.\n' +
        '2️⃣ Haz clic en "Inscribirse Ahora" y da el primer paso.\n' +
        '3️⃣ Completa tu información personal.\n' +
        '4️⃣ Sube el comprobante del pago inicial (transferencia o factura).\n' +
        '5️⃣ Envía tu solicitud.\n\n' +
        '⏱️ En 24-48 horas el equipo administrativo verificará tu inscripción y recibirás tus credenciales de acceso. \n\n' +
        '🎉 ¡Estás a un paso de comenzar tu carrera profesional!',
        [
          { label: '✨ Ver cursos disponibles', action: 'ver-cursos' },
          { label: '💎 Conocer inversión', action: 'precios' },
          { label: '🏠 Volver al inicio', action: 'inicio' }
        ]
      );
    } else if (action === 'precios') {
      addBotMessage(
        '💎 **Invierte en tu futuro profesional:**\n\n' +
        '🌟 **Cursos Mensuales** (Solo $90/mes):\n' +
        '• Cosmetología - 12 meses de excelencia\n' +
        '• Cosmiatría - 7 meses de especialización\n' +
        '• Maquillaje Profesional - 6 meses de arte\n' +
        '• Belleza Integral - 12 meses completos\n' +
        '• Alta Peluquería - 8 meses de maestría\n' +
        '• Moldin Queen - 6 meses de perfección\n\n' +
        '✨ **Cursos Especializados:**\n' +
        '• Lashista: $50 inicio + $26/clase (6 clases)\n' +
        '• Técnico en Uñas: $50 inicio + $15.40/clase (16 clases)\n\n' +
        '💝 **¡SIN MATRÍCULA!** Tu inversión incluye:\n' +
        '✓ Materiales de primera calidad\n' +
        '✓ Certificación profesional reconocida\n' +
        '✓ Acceso a instalaciones modernas\n\n' +
        '🌟 ¡Invierte en ti, invierte en tu futuro!',
        [
          { label: '✨ Explorar cursos', action: 'ver-cursos' },
          { label: '📝 Inscribirme ahora', action: 'matricula' },
          { label: '🏠 Volver al inicio', action: 'inicio' }
        ]
      );
    } else if (action === 'contacto') {
      addBotMessage(
        '💬 **¡Estamos aquí para ti!**\n\n' +
        '📍 **Visítanos:**\n' +
        'Escuela Jessica Vélez\n' +
        'Quito, Ecuador\n\n' +
        '📱 **WhatsApp:**\n' +
        '+593 99 123 4567\n' +
        '¡Escríbenos y resuelve todas tus dudas!\n\n' +
        '📧 **Email:**\n' +
        'info@escuelajessicavelez.com\n\n' +
        '🕐 **Horario de Atención:**\n' +
        'Lunes a Viernes: 9:00 AM - 6:00 PM\n' +
        'Sábados: 9:00 AM - 2:00 PM\n\n' +
        '✨ ¡Ven a conocer nuestras instalaciones y enamórate de tu futuro!',
        [
          { label: '✨ Ver cursos', action: 'ver-cursos' },
          { label: '🎓 Proceso de inscripción', action: 'matricula' },
          { label: '🏠 Volver al inicio', action: 'inicio' }
        ]
      );
    } else if (action === 'inicio') {
      const hour = new Date().getHours();
      let greeting = '¡Hola!';
      if (hour >= 5 && hour < 12) greeting = '¡Buenos días!';
      else if (hour >= 12 && hour < 19) greeting = '¡Buenas tardes!';
      else greeting = '¡Buenas noches!';
      
      addBotMessage(
        `${greeting} 😊 ¿En qué más puedo ayudarte a alcanzar tus sueños?`,
        [
          { label: '✨ Descubre tu curso ideal', action: 'cursos' },
          { label: '📝 Inscribirme ahora', action: 'matricula' },
          { label: '💎 Inversión en tu futuro', action: 'precios' },
          { label: '💬 Hablemos personalmente', action: 'contacto' }
        ]
      );
    }
  };

  const coursesData = [
    {
      name: 'Cosmetología',
      description: '12 meses • $90/mes',
      icon: <Flower2 size={20} color="#000" />,
      link: '/detalle-curso?curso=cosmetologia'
    },
    {
      name: 'Cosmiatría',
      description: '7 meses • $90/mes',
      icon: <Sparkles size={20} color="#000" />,
      link: '/detalle-curso?curso=cosmiatria'
    },
    {
      name: 'Maquillaje Profesional',
      description: '6 meses • $90/mes',
      icon: <Brush size={20} color="#000" />,
      link: '/detalle-curso?curso=maquillaje'
    },
    {
      name: 'Lashista Profesional',
      description: '6 clases • $50 + $26/clase',
      icon: <Eye size={20} color="#000" />,
      link: '/detalle-curso?curso=lashista'
    },
    {
      name: 'Técnico en Uñas',
      description: '16 clases • $50 + $15.40/clase',
      icon: <Hand size={20} color="#000" />,
      link: '/detalle-curso?curso=unas'
    },
    {
      name: 'Belleza Integral',
      description: '12 meses • $90/mes',
      icon: <Heart size={20} color="#000" />,
      link: '/detalle-curso?curso=integral'
    },
    {
      name: 'Alta Peluquería',
      description: '8 meses • $90/mes',
      icon: <Scissors size={20} color="#000" />,
      link: '/detalle-curso?curso=alta-peluqueria'
    },
    {
      name: 'Moldin Queen',
      description: '6 meses • $90/mes',
      icon: <Crown size={20} color="#000" />,
      link: '/detalle-curso?curso=moldin-queen'
    }
  ];

  return (
    <>
      {/* Botón flotante del chatbot */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
          backgroundSize: '200% 200%',
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.5), 0 0 0 0 rgba(251, 191, 36, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'scale(0.9) rotate(90deg)' : 'scale(1) rotate(0deg)',
          animation: isOpen ? 'none' : 'pulse 2.5s infinite, glow 3s infinite'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1.15) rotate(-10deg)';
            e.currentTarget.style.boxShadow = '0 12px 48px rgba(251, 191, 36, 0.7), 0 0 0 8px rgba(251, 191, 36, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'scale(0.9) rotate(90deg)' : 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(251, 191, 36, 0.5), 0 0 0 0 rgba(251, 191, 36, 0.4)';
        }}
      >
        {isOpen ? (
          <X size={30} color="#000" strokeWidth={3} />
        ) : (
          <MessageCircle size={30} color="#000" strokeWidth={3} />
        )}
      </div>

      {/* Ventana del chat */}
      {isOpen && (
        <div
          className="chat-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            top: '100px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: 'auto',
            maxHeight: 'calc(100vh - 200px)',
            background: theme === 'dark' 
              ? 'rgba(26, 26, 26, 0.98)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: theme === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1)',
            border: theme === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            zIndex: 998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Header del chat */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: '20px',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#000',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Asistente Virtual
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Escuela Jessica Vélez
              </p>
            </div>
          </div>

          {/* Área de mensajes */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((message) => (
              <div key={message.id} className="message-enter">
                {/* Mensaje */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: message.sender === 'bot' ? 'flex-start' : 'flex-end',
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: message.sender === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      background: message.sender === 'bot'
                        ? theme === 'dark'
                          ? 'rgba(251, 191, 36, 0.15)'
                          : 'rgba(251, 191, 36, 0.1)'
                        : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: message.sender === 'bot'
                        ? theme === 'dark' ? '#fff' : '#1f2937'
                        : '#000',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      fontFamily: 'Montserrat, sans-serif',
                      whiteSpace: 'pre-line',
                      boxShadow: message.sender === 'user'
                        ? '0 4px 12px rgba(251, 191, 36, 0.3)'
                        : 'none'
                    }}
                  >
                    {message.text}
                  </div>
                </div>

                {/* Opciones de botones */}
                {message.options && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: '12px'
                    }}
                  >
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option.action)}
                        className="option-button"
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: theme === 'dark'
                            ? '2px solid rgba(251, 191, 36, 0.4)'
                            : '2px solid rgba(251, 191, 36, 0.6)',
                          background: theme === 'dark'
                            ? 'rgba(251, 191, 36, 0.15)'
                            : 'rgba(251, 191, 36, 0.1)',
                          color: theme === 'dark' ? '#fbbf24' : '#d97706',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontFamily: 'Montserrat, sans-serif',
                          textAlign: 'left',
                          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme === 'dark'
                            ? 'rgba(251, 191, 36, 0.2)'
                            : 'rgba(251, 191, 36, 0.15)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = theme === 'dark'
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(251, 191, 36, 0.05)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mostrar cursos */}
                {message.showCourses && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '12px',
                      marginTop: '16px'
                    }}
                  >
                    {coursesData.map((course, index) => (
                      <Link
                        key={index}
                        to={course.link}
                        onClick={() => setIsOpen(false)}
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          background: theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)',
                          border: theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme === 'dark'
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(251, 191, 36, 0.08)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div
                          style={{
                            fontSize: '28px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            flexShrink: 0
                          }}
                        >
                          {course.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              color: theme === 'dark' ? '#fff' : '#1f2937',
                              marginBottom: '2px',
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            {course.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 59, 0.6)',
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            {course.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {/* Botón para volver al inicio después de mostrar cursos */}
                    <button
                      onClick={() => handleOptionClick('inicio')}
                      style={{
                        marginTop: '8px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: theme === 'dark'
                          ? '1px solid rgba(251, 191, 36, 0.3)'
                          : '1px solid rgba(251, 191, 36, 0.5)',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: '#000',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Montserrat, sans-serif',
                        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                      }}
                    >
                      🔄 Volver al inicio
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '4px 16px 16px 16px',
                    background: theme === 'dark'
                      ? 'rgba(251, 191, 36, 0.15)'
                      : 'rgba(251, 191, 36, 0.1)',
                    display: 'flex',
                    gap: '4px'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fbbf24',
                      animation: 'bounce 1.4s infinite ease-in-out'
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fbbf24',
                      animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fbbf24',
                      animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(251, 191, 36, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 8px 32px rgba(251, 191, 36, 0.8), 0 0 0 12px rgba(251, 191, 36, 0.15), 0 0 0 24px rgba(251, 191, 36, 0.05);
            transform: scale(1.05);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          30% {
            transform: translateY(-10px);
            opacity: 0.8;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        /* Efecto de brillo en el botón flotante */
        @keyframes glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        /* Animación para mensajes nuevos */
        .message-enter {
          animation: fadeIn 0.4s ease-out;
        }

        /* Efecto hover mejorado para botones de opciones */
        .option-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .option-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
          transition: left 0.5s;
        }

        .option-button:hover::before {
          left: 100%;
        }

        @media (max-width: 640px) {
          /* Ajustes para móvil - mantener padding desde header */
          .chat-window {
            top: 90px !important;
            maxHeight: calc(100vh - 180px) !important;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
