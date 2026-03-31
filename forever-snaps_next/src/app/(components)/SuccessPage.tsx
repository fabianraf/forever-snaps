import { useRouter } from "next/navigation";
import { DictionaryType as Dictionary } from "../constants/translations";

interface SuccessPageProps {
  uploading: boolean;
  handleCameraSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  slug: string;
  lang: string;
  dictionary: Dictionary;
}

const SuccessPage = ({ uploading, handleCameraSelect, slug, lang, dictionary }: SuccessPageProps) => {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white p-6 flex flex-col items-center justify-center font-sans text-white">
      <div className="bg-[#FBF7F4] backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#826b602e] max-w-sm w-full text-center">
        <div className="my-6 p-4 bg-[#f7efe8] rounded-xl border border-[#826b602e]">
          <div className="text-2xl mb-2 ">🎉 ✨ 🎉</div>
          <h4 className="text-[#7b6f6a] font-serif font-semibold text-lg">{dictionary.SUCCESS_PAGE.TITLE}</h4>
          <p className="text-[#7b6f6a] text-sm mt-1">{dictionary.SUCCESS_PAGE.SUBTITLE}</p>
        </div>
        <div className="my-2">
          <input type="file" accept="image/*" capture="environment" id="cameraInput" className="hidden" onChange={handleCameraSelect} disabled={uploading} />
          <label htmlFor="cameraInput" className={`block w-full py-4 rounded-2xl text-white font-semibold cursor-pointer transition-all ${uploading ? 'bg-gray-400' : 'bg-gradient-to-b from-[#d8a9af] to-[#c79299] shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95'}`}>
            {uploading ? dictionary.SUCCESS_PAGE.UPLOADING : dictionary.SUCCESS_PAGE.UPLOAD_ANOTHER}
          </label>
        </div>
        <div className="my-4">
          <button type="button" onClick={() => router.push(`/${lang}/${slug}/gallery`)} className="block w-full py-4 rounded-2xl bg-transparent border-2 border-gray-200 text-gray-700 font-semibold cursor-pointer transition-all active:scale-95">
            {dictionary.SUCCESS_PAGE.VIEW_GALLERY}
          </button>
        </div>
      </div>
    </main>
  );
};
export default SuccessPage;