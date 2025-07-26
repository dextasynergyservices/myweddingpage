import WeddingPageHero from "@/components/WeddingPageHero";
import WeddinPageOurStory from "@/components/WeddingPageOurStory";
import WeddingPageGallery from "@/components/WeddingPageGallery";
import WeddingPageGift from "@/components/WeddingPageGift";
import WeddingPageGuest from "@/components/WeddingPageGuest";

export default function WeddingPages() {
  return (
    <>
      <WeddingPageHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <WeddinPageOurStory />
        <WeddingPageGallery />
        <WeddingPageGift />
        <WeddingPageGuest />
      </div>
    </>
  );
}
