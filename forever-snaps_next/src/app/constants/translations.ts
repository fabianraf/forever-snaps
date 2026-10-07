export const DICTIONARY = {
  ES: {
    COMMON: { UPLOADING: "Subiendo...", CANCEL: "Cancelar", SUBMIT: "¡Subir Foto!", BACK_TO_TOP: "Volver arriba" },
    ALBUM_PAGE: {
      DESCRIPTION: "Nuestro amor se ve a través de sus ojos\n\nGracias por acompañarnos en nuestro sí para siempre.\n\nCada risa, cada abrazo y cada baile de hoy es parte de nuestra historia. Si tomaste fotos o videos, súbelos aquí y ayúdanos a guardar este día para siempre.\n\nCon amor,\nShaLi y Jonathan",
      TAKE_PHOTO: " Tomar foto",
      UPLOAD_GALLERY: "Subir desde galería",
      VIEW_GALLERY_BTN: "↓ Ver fotos del evento",
      DATE_LOCALE: "es-ES",
      UPLOADING: "Subiendo...",
      NOT_FOUND: "El slug de la boda no está definido.",
    },
    PREVIEW_PAGE: { TITLE: "Vista previa", DESCRIPTION: "Este momento será parte de nuestra historia ❤️", RETAKE: "🔄 Volver a tomar", CONFIRM: "✅ Subir Foto", UPLOADING: "Subiendo..." },
    SUCCESS_PAGE: { UPLOADING: "Subiendo...", TITLE: "¡Gracias por compartir!", SUBTITLE: "Tu foto ya forma parte del álbum de esta boda", UPLOAD_ANOTHER: "📸 Subir otra foto", VIEW_GALLERY: "👀 Ver galería" },
    GALLERY_PAGE: { TITLE_FALLBACK: "Galería de la Boda", SHARED_MOMENTS: "recuerdos compartidos", UPLOAD_MORE: "+ Subir más fotos", EMPTY_STATE: "Aún no hay fotos en esta galería.", EMPTY_SUBTEXT: "¡Sé el primero en compartir un recuerdo!", DOWNLOAD_ALL: "Descargar fotos" }
  },
  EN: {
    COMMON: { UPLOADING: "Uploading...", CANCEL: "Cancel", SUBMIT: "Upload Photo!", BACK_TO_TOP: "Back to top" },
    ALBUM_PAGE: {
      DESCRIPTION: "Our love is seen through your eyes\n\nThank you for joining us as we said yes forever.\n\nEvery laugh, every hug, and every dance today is part of our story. If you took photos or videos, upload them here and help us keep this day forever.\n\nWith love,\nShaLi y Jonathan",
      TAKE_PHOTO: "Take photo",
      UPLOAD_GALLERY: "Upload from gallery",
      VIEW_GALLERY_BTN: "↓ View event photos",
      DATE_LOCALE: "en-US",
      UPLOADING: "Uploading...",
      NOT_FOUND: "The wedding slug is not defined.",
    },
    PREVIEW_PAGE: { TITLE: "Preview", DESCRIPTION: "This moment will be part of our story ❤️", RETAKE: "🔄 Retake", CONFIRM: "✅ Upload Photo", UPLOADING: "Uploading..." },
    SUCCESS_PAGE: { UPLOADING: "Uploading...", TITLE: "Thank you for sharing!", SUBTITLE: "Your photo is now part of this wedding's album", UPLOAD_ANOTHER: "📸 Upload another photo", VIEW_GALLERY: "👀 View gallery" },
    GALLERY_PAGE: { TITLE_FALLBACK: "Wedding Gallery", SHARED_MOMENTS: "shared memories", UPLOAD_MORE: "+ Upload more photos", EMPTY_STATE: "There are no photos in this gallery yet.", EMPTY_SUBTEXT: "Be the first to share a memory!", DOWNLOAD_ALL: "Download photos" }
  }
};
export type DictionaryType = typeof DICTIONARY.ES;