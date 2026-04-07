'use client';

import { useState, useEffect, use } from "react";
import { getWeddingSettings, updateWeddingSettings } from "@/app/actions/settingsActions";
import { getPresignedUrl, getWeddingPhotos, deleteWeddingPhoto } from "@/app/actions/photoActions";
import { logoutAdmin } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";

interface SettingsPageProps {
  params: Promise<{ slug: string, lang: string }>;
}

type Photo = {
  id: string;
  url: string;
  createdAt: Date;
};

export default function SettingsAdminPage({ params }: SettingsPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const lang = resolvedParams.lang;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mainGreeting: '',
    secondaryText: '',
    primaryCtaLabel: '',
    secondaryCtaLabel: '',
    backgroundImageUrl: '',
  });

  useEffect(() => {
    Promise.all([
      getWeddingSettings(slug),
      getWeddingPhotos(slug)
    ]).then(([settingsData, photosData]) => {
      if (settingsData) {
        setFormData({
          mainGreeting: settingsData.mainGreeting || '',
          secondaryText: settingsData.secondaryText || '',
          primaryCtaLabel: settingsData.primaryCtaLabel || '',
          secondaryCtaLabel: settingsData.secondaryCtaLabel || '',
          backgroundImageUrl: settingsData.backgroundImageUrl || '',
        });
      }
      setPhotos(photosData);
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
      const response = await updateWeddingSettings(slug, formData);
      if (response && response.error) {
        if (response.error === "No autorizado") {
          router.push(`/${lang}/admin/login`);
          return;
        }
        setMessage(response.error);
        return;
      }
      setMessage('¡Configuración guardada con éxito!');
      router.refresh();
    } catch (error) {
      setMessage('Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, imageUrl: string) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar esta foto permanentemente?");
    if (!confirm) return;

    setDeletingId(photoId);
    const result = await deleteWeddingPhoto(photoId, imageUrl);

    if (result.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setMessage('Foto eliminada correctamente.');
    } else {
      setMessage(result.error || 'Error al eliminar foto.');
    }
    setDeletingId(null);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    router.push(`/${lang}/admin/login`);
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Panel de Control: {slug}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          {message && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Imagen de Fondo (Opcional)</label>
              {formData.backgroundImageUrl && (
                <img src={formData.backgroundImageUrl} alt="Fondo actual" className="h-32 object-cover rounded mb-2 shadow" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={saving} className="text-sm mt-2 cursor-pointer" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition cursor-pointer">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Moderación de Fotos ({photos.length})</h2>

          {photos.length === 0 ? (
            <p className="text-gray-500 italic">No hay fotos subidas para esta boda todavía.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border">
                  <img
                    src={photo.url}
                    alt="Wedding"
                    className={`w-full h-32 object-cover transition ${deletingId === photo.id ? 'opacity-50 grayscale' : ''}`}
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.url)}
                      disabled={deletingId === photo.id}
                      className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded hover:bg-red-700 disabled:bg-gray-500"
                    >
                      {deletingId === photo.id ? 'Borrando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}