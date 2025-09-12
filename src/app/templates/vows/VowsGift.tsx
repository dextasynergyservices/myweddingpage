"use client";

import { useScrollAnimation } from "@/app/templates/vows/hooks/useScrollAnimation";
import { Card, CardContent } from "@/app/templates/vows/components/ui/card";
import { Button } from "@/app/templates/vows/components/ui/button";

const giftItems = [
  {
    id: 1,
    name: "Dining Table Set",
    description: "Beautiful oak dining table for our new home",
    price: "₦1,200,000",
    image: "🪑",
  },
  {
    id: 2,
    name: "Kitchen Mixer",
    description: "Professional stand mixer for baking together",
    price: "₦350,000",
    image: "🥄",
  },
  {
    id: 3,
    name: "Bedding Set",
    description: "Luxury cotton bedding set, king size",
    price: "₦200,000",
    image: "🛏️",
  },
  {
    id: 4,
    name: "Coffee Machine",
    description: "Espresso machine for our morning coffee ritual",
    price: "₦450,000",
    image: "☕",
  },
  {
    id: 5,
    name: "Outdoor Grill",
    description: "Gas grill for backyard entertaining",
    price: "₦800,000",
    image: "🔥",
  },
  {
    id: 6,
    name: "Vacuum Cleaner",
    description: "Robot vacuum for easy home maintenance",
    price: "₦300,000",
    image: "🏠",
  },
];

export const GiftRegistrySection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);

  return (
    <section className="py-32 bg-background">
      <div className="container-wedding">
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-black mb-6">
            Gift Registry
          </h2>
          <div className="w-24 h-px bg-accent mx-auto mb-8" />
          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your presence at our wedding is the greatest gift of all. However, if you wish to honor
            us with a gift, we&apos;ve created this registry to help us start our new life together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-16 py-4 md:gap-8">
          {giftItems.map((item, index) => (
            <div
              key={item.id}
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <Card
                className={`h-full border-l-4 hover:shadow-soft transition-all duration-300 group`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {item.image}
                    </div>
                    <span className="font-heading text-lg font-semibold text-black/80">
                      {item.price}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl text-black/80 mb-2">{item.name}</h3>

                  <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                    >
                      Select Gift
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center bg-black/80 rounded-lg shadow-soft w-5/6 mx-auto py-16">
          <div className="elegant-card p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl text-white/70 mb-4">Cash Gifts</h3>
            <p className="font-body text-white/70 mb-6 leading-relaxed">
              If you prefer to give a cash gift, we&apos;ve set up a secure online fund to help us
              with our honeymoon and future home expenses.
            </p>
            <Button className="bg-white text-black transition-colors duration-300 rounded-full px-8 py-4 font-xl lg:font-2xl">
              Gift Cash
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
