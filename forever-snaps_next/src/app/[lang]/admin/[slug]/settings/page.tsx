'use client';

import { useState, useEffect, use } from "react";
import { getWeddingSettings, updateWeddingSettings } from "@/app/actions/settingsActions";
import { getPresignedUrl } from "@/app/actions/photoActions";
import { useRouter } from "next/navigation";

interface SettingsPageProps {
  params: Promise<{ slug: string, lang: string }>;
}

export default function SettingsAdminPage({ params }: SettingsPageProps) {  
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    mainGreeting: '',
    secondaryText: '',
    primaryCtaLabel: '',
    secondaryCtaLabel: '',
    backgroundImageUrl: '',
  });

  useEffect(() => {    
    getWeddingSettings(slug).then(data => {
      if (data) {
        setFormData({
          mainGreeting: data.mainGreeting || '',
          secondaryText: data.secondaryText || '',
          primaryCtaLabel: data.primaryCtaLabel || '',
          secondaryCtaLabel: data.secondaryCtaLabel || '',
          backgroundImageUrl: data.backgroundImageUrl || '',
        });
      }
      setLoading(false);
    });
  }, [slug]); 

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const { url, publicUrl } = await getPresignedUrl(file.name, file.type);
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setFormData(prev => ({ ...prev, backgroundImageUrl: publicUrl }));
    } catch (error) {
      setMessage("Error al subir imagen");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateWeddingSettings(slug, formData);
      setMessage('¡Configuración guardada con éxito!');
      router.refresh();
    } catch (error) {
      setMessage('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Configurar Welcome Page: {slug}</h1>
        {message && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Imagen de Fondo (Opcional)</label>
            {formData.backgroundImageUrl && (
              
              <img src={formData.backgroundImageUrl} alt="Fondo actual" className="h-32 object-cover rounded mb-2 shadow" />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={saving} className="text-sm" />
          </div>

          <div>
            <label className="block font-medium mb-1">Título Principal / Saludo</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Ej: Boda de Paolita y Fer"
              value={formData.mainGreeting} onChange={e => setFormData({ ...formData, mainGreeting: e.target.value })} />
          </div>

          <div>
            <label className="block font-medium mb-1">Texto Secundario</label>
            <textarea className="w-full border p-2 rounded" rows={3} placeholder="Comparte tus momentos con nosotros..."
              value={formData.secondaryText} onChange={e => setFormData({ ...formData, secondaryText: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Etiqueta Botón Primario</label>
              <input type="text" className="w-full border p-2 rounded" placeholder="Ej: Tomar foto"
                value={formData.primaryCtaLabel} onChange={e => setFormData({ ...formData, primaryCtaLabel: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Etiqueta Botón Secundario</label>
              <input type="text" className="w-full border p-2 rounded" placeholder="Ej: Subir desde galería"
                value={formData.secondaryCtaLabel} onChange={e => setFormData({ ...formData, secondaryCtaLabel: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}