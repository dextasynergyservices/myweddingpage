import React from "react";

export const GallerySection = (props: any) => {
  const { title, images = [] } = props;
  return (
    <section style={{ padding: "3rem 1rem", background: "#fafafa" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2>{title}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            marginTop: "1rem",
          }}
        >
          {images.map((src: string, i: number) => (
            <img
              key={i}
              src={src}
              alt={`gallery-${i}`}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
