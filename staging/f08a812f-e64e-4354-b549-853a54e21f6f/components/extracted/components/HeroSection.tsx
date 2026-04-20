import React from "react";

export const HeroSection = (props: any) => {
  const { title, subtitle, heroImage } = props;
  return (
    <section
      style={{
        backgroundImage: `url(${heroImage})`,
        padding: "4rem",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem" }}>{title}</h1>
        <p style={{ fontSize: "1.25rem" }}>{subtitle}</p>
      </div>
    </section>
  );
};

export default HeroSection;
