"use client";

import React, { useEffect, useRef, useState } from "react";
import { Gift, Check } from "lucide-react";
import styles from "@/styles/templates/elegance.module.css";

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

const GiftRegistry: React.FC<GiftRegistryProps> = (props) => {
  // Extract data from props with fallbacks
  const title = props.title || "Gift Registry";
  const description =
    props.description || "Help us build our home together with these thoughtfully chosen items";

  const gifts = props.gifts || [
    {
      id: 1,
      name: "Fine China Dinner Set",
      description: "Elegant 12-piece porcelain dinner set for special occasions",
      price: "₦299,000",
      image: "🍽️",
      purchased: false,
    },
    {
      id: 2,
      name: "Coffee Machine",
      description: "Premium espresso machine for our morning coffee ritual",
      price: "₦450,000",
      image: "☕",
      purchased: false,
    },
    {
      id: 3,
      name: "Egyptian Cotton Bedding",
      description: "Luxurious 400-thread count sheet set in sage green",
      price: "₦180,000",
      image: "🛏️",
      purchased: false,
    },
    {
      id: 4,
      name: "Cast Iron Cookware Set",
      description: "Professional-grade cookware for our culinary adventures",
      price: "₦320,000",
      image: "🍳",
      purchased: false,
    },
    {
      id: 5,
      name: "Garden Herb Kit",
      description: "Everything needed to start our herb garden",
      price: "₦85,000",
      image: "🌿",
      purchased: false,
    },
    {
      id: 6,
      name: "Photo Album",
      description: "Beautiful leather-bound album for our wedding memories",
      price: "₦120,000",
      image: "📸",
      purchased: false,
    },
  ];

  const bankDetails = props.bankDetails || {
    bankName: "Access Bank",
    accountNumber: "1234567890",
    accountName: "John & Jane Doe",
  };
  const [isVisible, setIsVisible] = useState(false);
  const [purchasedItems] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="registry" className={`${styles.py24} ${styles.bgGradientSection}`}>
      <div className={`${styles.container} ${styles.mxAuto} ${styles.px4}`}>
        <div
          ref={sectionRef}
          className={`${styles.textCenter} ${styles.mb16} ${styles.transitionAll} ${styles.duration800} ${
            isVisible ? styles.animateFadeInUp : `${styles.opacity0} ${styles.translateY8}`
          }`}
        >
          <Gift
            className={`${styles.w12} ${styles.h12} ${styles.mxAuto} ${styles.mb6} ${styles.textPrimary} ${styles.animateFloat}`}
          />
          <h2
            className={`${styles.fontDisplay} md:text-5xl text-2xl ${styles.fontBold} ${styles.textForeground} ${styles.mb6}`}
          >
            {title}
          </h2>
          <p
            className={`${styles.fontBody} ${styles.textXl} ${styles.textMutedForeground} ${styles.maxW3xl} ${styles.mxAuto}`}
          >
            {description}
          </p>
        </div>

        {/* Category Filter */}
        {/* <div className={`${styles.flex} ${styles.flexWrap} ${styles.justifyCenter} ${styles.gap3} ${styles.mb12}`}>
          <button className={`${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.hoverBgPrimary} ${styles.hoverTextPrimaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}>
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.hoverBgPrimary10} ${styles.hoverTextPrimary} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
            >
              {category}
            </button>
          ))}
        </div> */}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto`}>
          {gifts.map((item, index) => {
            const isPurchased = purchasedItems.has(item.id);

            return (
              <div
                key={item.id}
                className={`${styles.overflowHidden} ${styles.bgGradientCard} ${styles.shadowElevated} ${styles.hoverShadowGlow} ${styles.transitionAll} ${styles.duration500} ${
                  isVisible ? styles.animateScaleIn : `${styles.opacity0} ${styles.scale75}`
                } ${isPurchased ? styles.opacity60 : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.p6}>
                  <div className={`${styles.textCenter} ${styles.mb4}`}>
                    <div className={`${styles.text4xl} ${styles.mb3}`}>{item.image}</div>
                  </div>

                  <h3
                    className={`${styles.fontDisplay} ${styles.textXl} ${styles.fontSemibold} ${styles.textForeground} ${styles.mb2}`}
                  >
                    {item.name}
                  </h3>

                  <p
                    className={`${styles.fontBody} ${styles.textMutedForeground} ${styles.textSm} ${styles.mb4} ${styles.leadingRelaxed}`}
                  >
                    {item.description}
                  </p>

                  <div
                    className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.mb6}`}
                  >
                    <span
                      className={`${styles.fontDisplay} ${styles.text2xl} ${styles.fontBold} ${styles.textPrimary}`}
                    >
                      {item.price}
                    </span>
                  </div>

                  <div className={styles.spaceY3}>
                    {isPurchased ? (
                      <button
                        disabled
                        className={`${styles.wFull} ${styles.bgSecondary} ${styles.textSecondaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
                      >
                        <Check className={`${styles.w4} ${styles.h4} ${styles.mr2}`} />
                        Purchased
                      </button>
                    ) : (
                      <>
                        <button
                          className={`${styles.wFull} ${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.hoverBgPrimary} ${styles.hoverTextPrimaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
                        >
                          Purchase Gift
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`${styles.textCenter} ${styles.mt12}`}>
          <p className={`${styles.fontBody} ${styles.textMutedForeground} ${styles.mb4}`}>
            Can&apos;t find the perfect gift?
          </p>
          <div
            className={`${styles.flex} ${styles.flexWrap} ${styles.justifyCenter} ${styles.gap4}`}
          >
            <button
              className={`${styles.border2} ${styles.borderPrimary} ${styles.textPrimary} ${styles.hoverBgPrimary} ${styles.hoverTextPrimaryForeground} ${styles.fontSemibold} ${styles.px4} ${styles.py2} ${styles.roundedLg} ${styles.transitionAll}`}
            >
              Gift Cash
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftRegistry;
