import React from 'react';
import { X, AlertCircle, Phone, Mail } from 'lucide-react';

interface ModalCuentaBloqueadaProps {
    isOpen: boolean;
    motivo: string;
    fechaBloqueo: string;
    onClose: () => void;
}

const ModalCuentaBloqueada: React.FC<ModalCuentaBloqueadaProps> = ({
    isOpen,
    motivo,
    fechaBloqueo,
    onClose
}) => {
    if (!isOpen) return null;

    const formatearFecha = (fecha: string) => {
        try {
            return new Date(fecha).toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fecha;
        }
    };

    const handleCerrarSesion = () => {
        // Limpiar sesión
        sessionStorage.clear();
        localStorage.clear();

        // Redirigir al login
        window.location.href = '/';
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header con gradiente rojo */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white/20 p-4 rounded-full">
                            <AlertCircle className="w-12 h-12" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center">
                        Cuenta Bloqueada
                    </h2>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Mensaje principal */}
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                            Su cuenta ha sido bloqueada por falta de pagos.
                        </p>
                    </div>

                    {/* Detalles del bloqueo */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Motivo del bloqueo:
                            </p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                                {motivo}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Fecha de bloqueo:
                            </p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                                {formatearFecha(fechaBloqueo)}
                            </p>
                        </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            ¿Qué hacer ahora?
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                            Para reanudar su cuenta, debe regularizar sus pagos pendientes.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 dark:bg-blue-800 p-1 rounded">
                                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Acérquese a la escuela
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Visite nuestras oficinas en horario de atención
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 dark:bg-blue-800 p-1 rounded">
                                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Contacte al área administrativa
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Ellos le ayudarán a regularizar su situación
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón de cerrar sesión */}
                    <button
                        onClick={handleCerrarSesion}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalCuentaBloqueada;
