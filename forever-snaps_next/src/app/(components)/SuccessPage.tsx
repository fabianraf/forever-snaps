import { useRouter } from "next/navigation";
import type { DictionaryType } from "../constants/translations";

interface SuccessPageProps {
  uploading: boolean;
  handleCameraSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  slug: string;
  lang: string;
  dictionary: DictionaryType;
}

const SuccessPage = ({ uploading, handleCameraSelect, slug, lang, dictionary }: SuccessPageProps) => {
  const router = useRouter();
  return (
    <main className="feral-page p-6 flex flex-col items-center justify-center font-sans">
      <div className="feral-card p-8 max-w-sm w-full text-center">
        <div className="my-4 p-5 rounded-2xl bg-feral-cream border border-feral-orange/15">
          <div className="text-2xl mb-2">🎉 ✨ 🎉</div>
          <h4 className="text-feral-ink font-serif font-semibold text-lg">{dictionary.SUCCESS_PAGE.TITLE}</h4>
          <p className="text-feral-body text-sm mt-2">{dictionary.SUCCESS_PAGE.SUBTITLE}</p>
        </div>

        <div className="space-y-3 mt-6">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            id="cameraInput"
            className="hidden"
            onChange={handleCameraSelect}
            disabled={uploading}
          />
          <label
            htmlFor="cameraInput"
            className={uploading ? "btn-feral-primary opacity-60 pointer-events-none" : "btn-feral-primary"}
          >
            {uploading ? dictionary.SUCCESS_PAGE.UPLOADING : dictionary.SUCCESS_PAGE.UPLOAD_ANOTHER}
          </label>

          <button
            type="button"
            onClick={() => router.push(`/${lang}/${slug}/gallery`)}
            className="btn-feral-secondary"
          >
            {dictionary.SUCCESS_PAGE.VIEW_GALLERY}
          </button>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;
