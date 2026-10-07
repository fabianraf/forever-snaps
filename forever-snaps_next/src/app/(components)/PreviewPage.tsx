import type { DictionaryType } from "../constants/translations";

interface PreviewPageProps {
  previewUrl: string | null;
  uploading: boolean;
  confirmPreviewUpload: () => void;
  cancelPreview: () => void;
  dictionary: DictionaryType;
}

const PreviewPage = ({ previewUrl, uploading, confirmPreviewUpload, cancelPreview, dictionary }: PreviewPageProps) => {
  return (
    <main className="feral-page min-h-dvh w-full max-w-[100vw] box-border flex flex-col items-center justify-center font-sans text-feral-body overflow-x-hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-6">
      <div className="feral-card p-6 sm:p-8 w-full max-w-md mx-auto flex flex-col items-center box-border">
        <h2 className="text-2xl font-serif font-bold mb-2 text-feral-ink">{dictionary.PREVIEW_PAGE.TITLE}</h2>
        <p className="text-sm text-center mb-5">{dictionary.PREVIEW_PAGE.DESCRIPTION}</p>

        <div className="relative w-full aspect-[3/4] mb-6 rounded-2xl overflow-hidden shadow-md border border-feral-orange/10">
          <img src={previewUrl || undefined} alt="Vista previa" className="object-cover w-full h-full" />
        </div>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={confirmPreviewUpload}
            disabled={uploading}
            className="btn-feral-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? dictionary.PREVIEW_PAGE.UPLOADING : dictionary.PREVIEW_PAGE.CONFIRM}
          </button>
          <button
            onClick={cancelPreview}
            disabled={uploading}
            className="btn-feral-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dictionary.PREVIEW_PAGE.RETAKE}
          </button>
        </div>
      </div>
    </main>
  );
}

export default PreviewPage;
