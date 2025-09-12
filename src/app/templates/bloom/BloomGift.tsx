import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { Button } from "./components/ui/button";
import { Gift, Heart, ExternalLink, Check } from "lucide-react";
import Image from "next/image";
import styles from "@/styles/templates/bloom.module.css";

interface GiftRegistryProps {
  title?: string;
  description?: string;
  gifts?: Array<{
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    purchased?: boolean;
  }>;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
}

const GiftRegistry = ({
  title = "Gift Registry",
  description = "Help us build our home together with these thoughtfully chosen items",
  gifts = [
    {
      id: 1,
      name: "Kitchen Stand Mixer",
      description: "Professional-grade mixer for our baking adventures together",
      price: "$350",
      image: "https://images.unsplash.com/photo-1586909194449-5a4b03a1c5d8?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 2,
      name: "Fine China Dinner Set",
      description: "Elegant dinnerware for hosting family and friends",
      price: "$280",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      purchased: true,
    },
    {
      id: 3,
      name: "Cozy Throw Blankets",
      description: "Soft blankets for movie nights and lazy Sundays",
      price: "$85",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 4,
      name: "Coffee Table Books",
      description: "Beautiful photography books for our living room",
      price: "$120",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 5,
      name: "Garden Tool Set",
      description: "Premium tools for our future garden together",
      price: "$150",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
      purchased: false,
    },
    {
      id: 6,
      name: "Wine Glass Collection",
      description: "Crystal glasses for celebrating special moments",
      price: "$200",
      image: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?w=400&h=300&fit=crop",
      purchased: false,
    },
  ],
  bankDetails = {
    bankName: "Access Bank",
    accountNumber: "1234567890",
    accountName: "John & Jane Doe",
  },
}: GiftRegistryProps) => {
  const { elementRef, isVisible } = useScrollAnimation(0.2);

  return (
    <section
      className={`${styles.sectionPadding} ${styles.gradientSoft} py-16 relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div className={`${styles.floatingElement} absolute top-20 left-16 opacity-10`}>
        <Gift className={`w-28 h-28 text-accent ${styles.animateRomanticFloat}`} />
      </div>
      <div className={`${styles.floatingElement} absolute bottom-32 right-20 opacity-10`}>
        <Heart
          className={`w-20 h-20 text-primary ${styles.animateRomanticFloat}`}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className={`${styles.containerBloom} mx-auto px-4`}>
        {/* Header */}
        <div
          ref={elementRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2
            className={`${styles.fontHeading} text-2xl md:text-5xl font-bold ${styles.textForeground} mb-6`}
          >
            {title}
          </h2>
          <div className={`${styles.bgGradientRose} w-24 h-1 mx-auto mb-8`}></div>
          <p className={`text-xl ${styles.textMuted} max-w-3xl mx-auto leading-relaxed`}>
            {description}
          </p>
        </div>

        {/* Gift Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {gifts.map((gift, index) => (
            <div
              key={gift.id}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`${styles.bgCard} ${styles.roundedLg} overflow-hidden ${styles.shadowSoft} hover:${styles.shadowRomantic} ${styles.transitionRomantic} group`}
              >
                {/* Gift Image */}
                <div className="relative overflow-hidden">
                  <Image
                    src={gift.image}
                    alt={gift.name}
                    className={`${styles.giftImage} w-full h-40 sm:h-48 object-cover ${styles.transitionRomantic} group-hover:scale-105`}
                    width={400}
                    height={192}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {gift.purchased && (
                    <div
                      className={`${styles.giftPurchasedOverlay} absolute inset-0 bg-primary/80 flex items-center justify-center`}
                    >
                      <div
                        className={`${styles.giftPurchasedContent} text-center text-primary-foreground`}
                      >
                        <Check className={`${styles.giftPurchasedIcon} w-12 h-12 mx-auto mb-2`} />
                        <p className={`${styles.giftPurchasedText} font-semibold`}>Thank You!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gift Details */}
                <div className="p-4 sm:p-6">
                  <h3
                    className={`${styles.fontHeading} text-lg sm:text-xl font-semibold ${styles.textForeground} mb-2`}
                  >
                    {gift.name}
                  </h3>
                  <p className={`${styles.textMuted} mb-4 leading-relaxed text-sm sm:text-base`}>
                    {gift.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span
                      className={`${styles.giftPrice} font-semibold text-xl sm:text-2xl text-primary`}
                    >
                      {gift.price}
                    </span>

                    {gift.purchased ? (
                      <Button
                        variant="secondary"
                        disabled
                        className={`${styles.giftPurchasedButton} bg-[hsl(340,75%,55%)] text-white opacity-60 w-full sm:w-auto`}
                      >
                        <Check className={`${styles.giftButtonIcon} w-4 h-4 mr-2`} />
                        Purchased
                      </Button>
                    ) : (
                      <Button
                        variant="romantic"
                        className={`${styles.giftPurchaseButton} bg-[hsl(340,75%,55%)] text-white group/btn w-full sm:w-auto`}
                      >
                        <span className="hidden sm:inline">Purchase Gift</span>
                        <span className="sm:hidden">Purchase</span>
                        <ExternalLink
                          className={`${styles.giftButtonIcon} w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1`}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div
            className={`${styles.bgCard} p-8 ${styles.roundedLg} ${styles.shadowSoft} max-w-2xl mx-auto`}
          >
            <Gift className={`${styles.giftInfoIcon} w-12 h-12 text-primary mx-auto mb-4`} />
            <h3
              className={`${styles.fontHeading} text-2xl font-semibold ${styles.textForeground} mb-4`}
            >
              Other Ways to Give
            </h3>
            <p className={`${styles.textMuted} mb-6 leading-relaxed`}>
              We&apos;re also registered at Target and Williams Sonoma. You can find our registries
              online or contribute to our honeymoon fund if you prefer.
            </p>
            <div
              className={`${styles.giftInfoButtons} flex flex-col sm:flex-row gap-4 justify-center`}
            >
              <Button
                variant="outline"
                className={`${styles.giftInfoButton} bg-[hsl(340,75%,55%)] text-white group`}
              >
                Gift Cash
                <Heart className={`${styles.giftButtonIcon} w-4 h-4 ml-2 text-primary`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftRegistry;
