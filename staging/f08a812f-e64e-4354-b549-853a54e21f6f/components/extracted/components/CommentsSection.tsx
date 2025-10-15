import React from "react";

export const CommentsSection = (props: any) => {
  const { title, existingMessages = [] } = props;
  return (
    <section style={{ padding: "2rem 1rem", background: "#fff9f5" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2>{title}</h2>
        <ul>
          {existingMessages.map((m: any) => (
            <li key={m.id}>
              <strong>{m.name}</strong>: {m.message}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CommentsSection;
