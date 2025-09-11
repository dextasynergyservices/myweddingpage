"use client";

import React from "react";
import HowToHero from "@/components/HowToHero";
import HowToSteps from "@/components/HowToSteps";
import HowToFAQ from "@/components/HowToFAQ";
import HowToVideos from "@/components/HowToVideos";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowToPage() {
  return (
    <>
      <Navbar />
      <HowToHero />
      <HowToSteps />
      <HowToFAQ />
      <HowToVideos />
      <Footer />
    </>
  );
}
