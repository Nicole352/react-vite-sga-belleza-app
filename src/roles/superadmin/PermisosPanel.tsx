import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, BookOpen, DollarSign, Check, X, Plus, Trash2, Eye, History, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Permiso {
  id_permiso: number;
  codigo_permiso: string;
  nombre_permiso: string;
  descripcion: string;
  modulo: string;
  estado: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  nombre_rol: string;
  estado: string;
}

interface PermisoUsuario {
  codigo_permiso: string;
  nombre_permiso: string;
  descripcion: string;
  modulo: string;
  fecha_asignacion: string;
  asignado_por_nombre: string;
  asignado_por_apellido: string;
}

interface HistorialPermiso {
  accion: string;
  codigo_permiso: string;
  nombre_permiso: string;
  modulo: string;
  realizado_por_nombre: string;
  realizado_por_apellido: string;
  fecha_accion: string;
  detalles: string;
}

const PermisosPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState