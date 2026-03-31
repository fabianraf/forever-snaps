import { DictionaryType } from "../constants/translations";

const PreviewPage = ({ previewUrl, uploading, confirmPreviewUpload, cancelPreview, dictionary }: { previewUrl: string | null; uploading: boolean; confirmPreviewUpload: () => void; cancelPreview: () => void; dictionary: DictionaryType }) => {
  return (
    <main className="min-h-screen bg-white p-6 flex flex-col items-center justify-center font-sans text-gray-700">
      <div className="bg-white backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-300 max-w-sm w-full flex flex-col items-center">
        <h2 className="text-2xl font-serif font-bold mb-4">{dictionary.PREVIEW_PAGE.TITLE}</h2>
        <p>{dictionary.PREVIEW_PAGE.DESCRIPTION}</p>
        <div className="relative w-full aspect-[3/4] mb-6 rounded-xl overflow-hidden shadow-md">
          <img src={previewUrl || undefined} alt="Vista previa" className="object-cover w-full h-full" />
        </div>
        <div className="flex flex-col w-full gap-4">
          <button onClick={confirmPreviewUpload} disabled={uploading} className="flex-1 py-3 rounded-2xl text-white font-semibold bg-gradient-to-b from-[#d8a9af] to-[#c79299] shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95 transition-all disabled:opacity-50">
            {uploading ? dictionary.PREVIEW_PAGE.UPLOADING : dictionary.PREVIEW_PAGE.CONFIRM}
          </button>
          <button onClick={cancelPreview} disabled={uploading} className="flex-1 py-3 rounded-2xl bg-white text-black font-semibold active:scale-95 transition-all disabled:opacity-50">
            {dictionary.PREVIEW_PAGE.RETAKE}
          </button>
        </div>
      </div>
    </main>
  );
}
export default PreviewPage;