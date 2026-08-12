'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Config = {
  alertaAutomatica: boolean;
  umbralMagnitud: string;
  intervaloCheckin: string;
  notificacionesPush: boolean;
  notificacionesEmail: boolean;
  notificacionesSMS: boolean;
  zonaRadio: string;
  mapboxToken: string;
  tiempoSinRespuesta: string;
  tiempoAlertaSOS: string;
};

const defaultConfig: Config = {
  alertaAutomatica: true,
  umbralMagnitud: '4.0',
  intervaloCheckin: '15',
  notificacionesPush: true,
  notificacionesEmail: true,
  notificacionesSMS: false,
  zonaRadio: '200',
  mapboxToken: '',
  tiempoSinRespuesta: '15',
  tiempoAlertaSOS: '5',
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'configuracion', 'sistema')).then(snap => {
      if (snap.exists()) setConfig({ ...defaultConfig, ...snap.data() as Config });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string | boolean) => {
    setSaved(false);
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'configuracion', 'sistema'), config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Configuración</h2>
          <p className="text-xs text-gray-500">Parámetros del sistema de alerta y monitoreo</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'}`}>
          {saved ? '✅ Guardado' : saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
        </button>
      </header>

      <div className="p-6 space-y-6 max-w-4xl">
        <Section title="⚡ Sistema de Alertas" description="Configuración del disparo automático de alertas">
          <ToggleRow label="Alerta automática por sismo" description="Disparar alerta al personal cuando se detecta un sismo significativo"
            value={config.alertaAutomatica} onChange={(v) => handleChange('alertaAutomatica', v)} />
          <InputRow label="Umbral de magnitud" description="Magnitud mínima para disparar alerta automática"
            value={config.umbralMagnitud} onChange={(v) => handleChange('umbralMagnitud', v)} suffix="M" />
          <InputRow label="Radio de zona de impacto" description="Distancia máxima del epicentro para considerar personal en riesgo"
            value={config.zonaRadio} onChange={(v) => handleChange('zonaRadio', v)} suffix="km" />
        </Section>

        <Section title="📍 Monitoreo de Personal" description="Parámetros de seguimiento y check-in">
          <InputRow label="Intervalo de check-in" description="Tiempo entre verificaciones automáticas de estado del personal"
            value={config.intervaloCheckin} onChange={(v) => handleChange('intervaloCheckin', v)} suffix="min" />
          <InputRow label="Tiempo sin respuesta" description="Minutos sin respuesta antes de marcar como 'Sin respuesta'"
            value={config.tiempoSinRespuesta} onChange={(v) => handleChange('tiempoSinRespuesta', v)} suffix="min" />
          <InputRow label="Timeout alerta SOS" description="Minutos para confirmar recepción de SOS antes de escalar"
            value={config.tiempoAlertaSOS} onChange={(v) => handleChange('tiempoAlertaSOS', v)} suffix="min" />
        </Section>

        <Section title="🔔 Notificaciones" description="Canales de comunicación con el personal">
          <ToggleRow label="Notificaciones Push" description="Enviar alertas push a la app móvil del personal"
            value={config.notificacionesPush} onChange={(v) => handleChange('notificacionesPush', v)} />
          <ToggleRow label="Notificaciones Email" description="Enviar resúmenes y alertas por correo electrónico"
            value={config.notificacionesEmail} onChange={(v) => handleChange('notificacionesEmail', v)} />
          <ToggleRow label="Notificaciones SMS" description="Enviar alertas críticas por SMS (requiere créditos Twilio)"
            value={config.notificacionesSMS} onChange={(v) => handleChange('notificacionesSMS', v)} />
        </Section>

        <Section title="🔗 Integraciones" description="Tokens y claves de servicios externos">
          <InputRow label="Mapbox Token" description="Token de acceso para el mapa vectorial en vivo"
            value={config.mapboxToken} onChange={(v) => handleChange('mapboxToken', v)} placeholder="pk.eyJ1Ijoi..." />
        </Section>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">ℹ️ Información del Sistema</h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Versión" value="0.1.0-alpha" />
            <InfoItem label="Entorno" value="Producción" />
            <InfoItem label="Framework" value="Next.js 14.2" />
            <InfoItem label="Plataforma" value="Vercel" />
            <InfoItem label="Base de datos" value="Firebase Firestore ✅" />
            <InfoItem label="Auth" value="Firebase Auth ✅" />
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-0.5">{title}</h3>
      <p className="text-[10px] text-gray-500 mb-4">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div><p className="text-xs font-medium">{label}</p><p className="text-[10px] text-gray-500">{description}</p></div>
      <button onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-white/10'}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function InputRow({ label, description, value, onChange, suffix, placeholder }: {
  label: string; description: string; value: string; onChange: (v: string) => void; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 gap-4">
      <div className="flex-1"><p className="text-xs font-medium">{label}</p><p className="text-[10px] text-gray-500">{description}</p></div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white text-right focus:outline-none focus:border-blue-500 transition" />
        {suffix && <span className="text-[10px] text-gray-500 w-6">{suffix}</span>}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
