import { NextResponse } from "next/server";

export async function GET() {
  // Generate sample wedding designs for demonstration
  const sampleWeddings = [
    {
      coupleNames: "Sarah & Michael",
      date: "June 15, 2025",
      venue: "Garden Estate Resort",
      theme: "romantic",
      thumbnail:
        "https://placehold.co/800x600/fce7f3/be185d?text=Sarah%20%26%20Michael%0AJune%2015%2C%202025%0AGarden%20Estate%20Resort&font=georgia",
    },
    {
      coupleNames: "Emma & James",
      date: "August 20, 2025",
      venue: "Beachfront Villa",
      theme: "beach",
      thumbnail:
        "https://placehold.co/800x600/dbeafe/1e40af?text=Emma%20%26%20James%0AAugust%2020%2C%202025%0ABeachfront%20Villa&font=source-sans",
    },
    {
      coupleNames: "Isabella & Alexander",
      date: "September 10, 2025",
      venue: "Historic Manor",
      theme: "elegant",
      thumbnail:
        "https://placehold.co/800x600/f3f4f6/1f2937?text=Isabella%20%26%20Alexander%0ASeptember%2010%2C%202025%0AHistoric%20Manor&font=playfair",
    },
    {
      coupleNames: "Olivia & William",
      date: "October 5, 2025",
      venue: "Rustic Barn",
      theme: "rustic",
      thumbnail:
        "https://placehold.co/800x600/fef3c7/92400e?text=Olivia%20%26%20William%0AOctober%205%2C%202025%0ARustic%20Barn&font=merriweather",
    },
    {
      coupleNames: "Sophia & Ethan",
      date: "May 12, 2025",
      venue: "Botanical Gardens",
      theme: "garden",
      thumbnail:
        "https://placehold.co/800x600/ecfdf5/059669?text=Sophia%20%26%20Ethan%0AMay%2012%2C%202025%0ABotanical%20Gardens&font=lora",
    },
    {
      coupleNames: "Charlotte & Benjamin",
      date: "November 18, 2025",
      venue: "Grand Ballroom",
      theme: "vintage",
      thumbnail:
        "https://placehold.co/800x600/fdf2f8/be185d?text=Charlotte%20%26%20Benjamin%0ANovember%2018%2C%202025%0AGrand%20Ballroom&font=dancing-script",
    },
  ];

  // Generate HTML page to display the wedding designs
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wedding Design Gallery - Theme-Based Designs</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            h1 {
                text-align: center;
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .subtitle {
                text-align: center;
                color: #718096;
                margin-bottom: 40px;
                font-size: 1.2em;
            }
            .gallery {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 30px;
                margin-top: 30px;
            }
            .wedding-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .wedding-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            }
            .wedding-image {
                width: 100%;
                height: 250px;
                object-fit: cover;
                border-bottom: 3px solid #e2e8f0;
            }
            .wedding-info {
                padding: 20px;
            }
            .couple-names {
                font-size: 1.4em;
                font-weight: bold;
                color: #2d3748;
                margin-bottom: 8px;
            }
            .wedding-details {
                color: #718096;
                margin-bottom: 15px;
                line-height: 1.6;
            }
            .theme-badge {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 600;
                text-transform: capitalize;
            }
            .theme-romantic { background: #fce7f3; color: #be185d; }
            .theme-beach { background: #dbeafe; color: #1e40af; }
            .theme-elegant { background: #f3f4f6; color: #1f2937; }
            .theme-rustic { background: #fef3c7; color: #92400e; }
            .theme-garden { background: #ecfdf5; color: #059669; }
            .theme-vintage { background: #fdf2f8; color: #be185d; }
            .features {
                background: white;
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 40px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .features h2 {
                color: #2d3748;
                margin-bottom: 20px;
            }
            .features ul {
                list-style: none;
                padding: 0;
            }
            .features li {
                padding: 8px 0;
                color: #4a5568;
            }
            .features li:before {
                content: "✓ ";
                color: #059669;
                font-weight: bold;
                margin-right: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 Wedding Design Gallery</h1>
            <p class="subtitle">Automatic theme-based wedding designs generated for each couple</p>

            <div class="features">
                <h2>🚀 Features of Our Wedding Design System</h2>
                <ul>
                    <li><strong>Theme-Based Styling:</strong> Each wedding gets colors and fonts that match their chosen theme</li>
                    <li><strong>Automatic Generation:</strong> Designs are created automatically using bride & groom names, date, and venue</li>
                    <li><strong>Professional Typography:</strong> Different fonts for different themes (Georgia for romantic, Playfair for elegant, etc.)</li>
                    <li><strong>Color Psychology:</strong> Themes use colors that evoke the right emotions for each wedding style</li>
                    <li><strong>Multi-Layer Fallback:</strong> If Canva API fails, beautiful themed placeholders ensure every wedding has a design</li>
                    <li><strong>Editable Links:</strong> Each design links to Canva with pre-filled wedding information for easy editing</li>
                </ul>
            </div>

            <div class="gallery">
                ${sampleWeddings
                  .map(
                    (wedding) => `
                    <div class="wedding-card">
                        <img src="${wedding.thumbnail}" alt="${wedding.coupleNames} Wedding Design" class="wedding-image">
                        <div class="wedding-info">
                            <div class="couple-names">${wedding.coupleNames}</div>
                            <div class="wedding-details">
                                📅 ${wedding.date}<br>
                                📍 ${wedding.venue}
                            </div>
                            <span class="theme-badge theme-${wedding.theme}">${wedding.theme} theme</span>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>

            <div style="text-align: center; margin-top: 40px; padding: 20px; background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3>🎨 How It Works</h3>
                <p style="color: #718096; line-height: 1.6;">
                    When users publish their wedding pages, our system automatically:<br>
                    1️⃣ Extracts bride & groom names, wedding date, venue, and theme<br>
                    2️⃣ Tries to create a design using Canva's API<br>
                    3️⃣ Falls back to beautiful themed placeholders if needed<br>
                    4️⃣ Provides edit links so couples can customize their designs
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
