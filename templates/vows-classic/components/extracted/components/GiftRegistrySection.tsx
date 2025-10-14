import React from 'react';

export const GiftRegistrySection = (props: any) => {
  const { title, gifts = [] } = props;
  return (
    <section style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2>{title}</h2>
        <ul>
          {gifts.map((g: any) => (
            <li key={g.id}>{g.name} — {g.price}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default GiftRegistrySection;
