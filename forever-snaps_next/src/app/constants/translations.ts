export const DICTIONARY = {
  ES: {
    COMMON: { UPLOADING: "Subiendo...", CANCEL: "Cancelar", SUBMIT: "¡Subir Foto!", BACK_TO_TOP: "Volver arriba" },
    ALBUM_PAGE: { DESCRIPTION: "Comparte tus momentos con nosotros y ayúdanos a guardar cada recuerdo de esta noche.", TAKE_PHOTO: "📸 Tomar foto", UPLOAD_GALLERY: "🖼️ Subir desde galería", VIEW_GALLERY_BTN: "↓ Ver fotos del evento", DATE_LOCALE: "es-ES", UPLOADING: "Subiendo...", NOT_FOUND: "El slug de la boda no está definido." },
    PREVIEW_PAGE: { TITLE: "Vista previa", DESCRIPTION: "Este momento será parte de nuestra historia ❤️", RETAKE: "🔄 Volver a tomar", CONFIRM: "✅ Subir Foto", UPLOADING: "Subiendo..." },
    SUCCESS_PAGE: { UPLOADING: "Subiendo...", TITLE: "¡Gracias por compartir!", SUBTITLE: "Tu foto ya forma parte del álbum de esta boda", UPLOAD_ANOTHER: "📸 Subir otra foto", VIEW_GALLERY: "👀 Ver galería" },
    GALLERY_PAGE: { TITLE_FALLBACK: "Galería de la Boda", SHARED_MOMENTS: "recuerdos compartidos", UPLOAD_MORE: "+ Subir más fotos", EMPTY_STATE: "Aún no hay fotos en esta galería.", EMPTY_SUBTEXT: "¡Sé el primero en compartir un recuerdo!" }
  },
  EN: {
    COMMON: { UPLOADING: "Uploading...", CANCEL: "Cancel", SUBMIT: "Upload Photo!", BACK_TO_TOP: "Back to top" },
    ALBUM_PAGE: { DESCRIPTION: "Share your moments with us and help us keep every memory of tonight.", TAKE_PHOTO: "📸 Take photo", UPLOAD_GALLERY: "🖼️ Upload from gallery", VIEW_GALLERY_BTN: "↓ View event photos", DATE_LOCALE: "en-US", UPLOADING: "Uploading...", NOT_FOUND: "The wedding slug is not defined." },
    PREVIEW_PAGE: { TITLE: "Preview", DESCRIPTION: "This moment will be part of our story ❤️", RETAKE: "🔄 Retake", CONFIRM: "✅ Upload Photo", UPLOADING: "Uploading..." },
    SUCCESS_PAGE: { UPLOADING: "Uploading...", TITLE: "Thank you for sharing!", SUBTITLE: "Your photo is now part of this wedding's album", UPLOAD_ANOTHER: "📸 Upload another photo", VIEW_GALLERY: "👀 View gallery" },
    GALLERY_PAGE: { TITLE_FALLBACK: "Wedding Gallery", SHARED_MOMENTS: "shared memories", UPLOAD_MORE: "+ Upload more photos", EMPTY_STATE: "There are no photos in this gallery yet.", EMPTY_SUBTEXT: "Be the first to share a memory!" }
  }
};
export type DictionaryType = typeof DICTIONARY.ES;