import { getDictionary, Locale } from "@/utils/getDictionary";
import WeddingAlbumClient from "./WeddingAlbumClient";
import { notFound } from "next/navigation";
import { getWeddingSettings } from "@/app/actions/settingsActions";

interface PageProps {
  params: Promise<{ lang: Locale; slug: string; }>;
}

const WeddingAlbumPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  if (!resolvedParams.slug) notFound();

  const dictionary = await getDictionary(resolvedParams.lang);  
  const settings = await getWeddingSettings(resolvedParams.slug);
  return (
    <WeddingAlbumClient
      slug={resolvedParams.slug}
      lang={resolvedParams.lang}
      dictionary={dictionary}
      settings={settings} 
    />
  );
}

export default WeddingAlbumPage;