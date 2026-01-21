import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * Script de Prueba de Carga para el Backend (API) - SGA Belleza
 * Enfocado en medir el tiempo de respuesta del servidor y la base de datos.
 */

export const options = {
    stages: [
        { duration: '30s', target: 10 }, // Ramp-up a 10 usuarios
        { duration: '1m', target: 10 },  // Estable con 10 usuarios
        { duration: '30s', target: 30 }, // Stress-test con 30 usuarios
        { duration: '1m', target: 30 },  // Estable con 30 usuarios
        { duration: '30s', target: 0 },  // Ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<1500'], // El 95% de las peticiones deben durar menos de 1.5s
        http_req_failed: ['rate<0.01'],    // Menos del 1% de errores
    },
};

export default function () {
    const API_URL = 'https://backend-sga-belleza.onrender.com/api';

    // 1. Probar el endpoint de salud (Health Check)
    // Este endpoint verifica la conexión con la base de datos
    const res = http.get(`${API_URL}/health`);

    check(res, {
        'API responde 200': (r) => r.status === 200,
        'BD conectada': (r) => r.body.includes('ok'),
    });

    // 2. Simular carga en el Dashboard (Opcional - requiere token, pero medimos latencia)
    const resStats = http.get(`${API_URL}/dashboard/stats`);

    // No esperamos 200 aquí (faltará token), pero medimos cuánto tarda el servidor en rechazarla
    check(resStats, {
        'Servidor responde': (r) => r.status !== 0,
    });

    sleep(1);
}
