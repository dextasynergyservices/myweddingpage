import React from "react";

export const OurStorySection = (props: any) => {
  const { title, content, storyImage1, storyImage2 } = props;
  return (
    <section style={{ padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2>{title}</h2>
        <p>{content}</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <img src={storyImage1} alt="story1" style={{ width: "50%" }} />
          <img src={storyImage2} alt="story2" style={{ width: "50%" }} />
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
