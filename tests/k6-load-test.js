import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * Script de Prueba de Carga para SGA Belleza (k6)
 * Simula usuarios concurrentes accediendo a la plataforma en Render.
 */

export const options = {
    // Configuración de la carga (Ramping up)
    stages: [
        { duration: '30s', target: 10 }, // Sube a 10 usuarios en 30 segundos
        { duration: '1m', target: 10 },  // Se mantiene en 10 usuarios por 1 minuto
        { duration: '30s', target: 30 }, // Sube a 20 usuarios en 30 segundos
        { duration: '1m', target: 30 },  // Se mantiene en 20 usuarios por 1 minuto
        { duration: '30s', target: 0 },  // Baja a 0 usuarios (Ramp-down)
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // El 95% de las peticiones deben durar menos de 2s
        http_req_failed: ['rate<0.01'],    // Menos del 1% de fallos
    },
};

export default function () {
    const BASE_URL = 'https://react-vite-sga-belleza-app.onrender.com';

    // 1. Visitar página de inicio/login
    const res = http.get(BASE_URL);

    // Verificar que la página responda 200 OK
    check(res, {
        'status es 200': (r) => r.status === 200,
        'contenido cargado': (r) => r.body.includes('Jessica'), // Busca texto representativo
    });

    // Simular tiempo de lectura/acción del usuario (1 a 5 segundos)
    sleep(Math.random() * 4 + 1);
}
