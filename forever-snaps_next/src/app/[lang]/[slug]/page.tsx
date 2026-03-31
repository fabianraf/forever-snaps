import { getDictionary, Locale } from "@/utils/getDictionary";
import WeddingAlbumClient from "./WeddingAlbumClient";

interface PageProps {
  params: Promise<{ lang: Locale; slug: string; }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.lang);

  return <WeddingAlbumClient slug={resolvedParams.slug} lang={resolvedParams.lang} dictionary={dictionary} />;
}