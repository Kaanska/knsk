const fs = require('fs');
const path = require('path');

const themes = [
    { eyebrow: "MİSYONUMUZ", headline: "Finansal<br><span class='gradient-word'>Özgürlük.</span>", sub: "Bağımsızlık yolunda Vynto senin pusulan olsun.", type: "quote", val: "Özgürlük, neye harcayacağını bilmektir.", icon: "🗽", color: "#4facfe" },
    { eyebrow: "STRATEJİ", headline: "Portföyünü<br><span class='gradient-word'>Dengede Tut.</span>", sub: "Risklerini dağıt, kazancını optimize et. Her şey dengede güzel.", type: "stat", label: "Sepet Dağılımı", val: "%50 Nakit / %50 Yatırım", icon: "⚖️", color: "#43e97b" },
    { eyebrow: "GÜVENLİK", headline: "Acil<br><span class='gradient-word'>Durum Fonu.</span>", sub: "Hayat sürprizlerle dolu. En az 6 aylık giderini kenara ayır, huzurla uyu.", type: "push", title: "GÜVENLİK TAMPONU", msg: "Hedefine ₺5.000 kaldı! 🔥", icon: "🛡️", color: "#FF9966" },
    { eyebrow: "PASİF GELİR", headline: "Paran<br><span class='gradient-word'>Senin İçin Çalışsın.</span>", sub: "Temettü ve kira gelirleriyle geleceğini bugünden inşa et.", type: "stat", label: "Aylık Pasif Gelir", val: "₺8.250", icon: "💸", color: "#a18cd1" },
    { eyebrow: "PSİKOLOJİ", headline: "FOMO'ya<br><span class='gradient-word'>Teslim Olma.</span>", sub: "Fırsat kaçmaz, sadece şekil değiştirir. Sabır en büyük yatırımdır.", type: "quote", val: "Piyasa sabırsızdan sabırlıya para aktarır.", icon: "🧘", color: "#fbc2eb" },
    { eyebrow: "TASARRUF", headline: "Abonelikleri<br><span class='gradient-word'>Minimalize Et.</span>", sub: "Kullanmadığın her abonelik geleceğinden çalınan bir parçadır.", type: "push", title: "ABONELİK UYARISI", msg: "3 aydır açmadığın uygulama için ödeme yapıyorsun.", icon: "✂️", color: "#f5576c" },
    { eyebrow: "EĞİTİM", headline: "Bileşik Faiz<br><span class='gradient-word'>Mucizesi.</span>", sub: "Zamanla kartopu gibi büyüyen varlıklarını izle. Sabrın meyvesi tatlıdır.", type: "stat", label: "10 Yıllık Projeksiyon", val: "x8 Kazanç", icon: "⏳", color: "#f6d365" },
    { eyebrow: "BÜTÇE", headline: "Akıllıca<br><span class='gradient-word'>Harca.</span>", sub: "Nereye gittiğini bilmediğin para, senin değildir. Vynto ile her kuruşu izle.", type: "stat", label: "Bütçe Disiplini", val: "Tam Puan", icon: "🧠", color: "#1fa2ff" },
    { eyebrow: "HEDEF", headline: "Hayallerine<br><span class='gradient-word'>Ulaş.</span>", sub: "Yeni bir ev mi, dünya turu mu? Vynto ile hedefine ne kadar kaldığını gör.", type: "push", title: "HEDEF GÜNCELLEMESİ", msg: "Tatil fonu %75 tamamlandı! 🌴", icon: "🏠", color: "#a6ffcb" },
    { eyebrow: "DİSİPLİN", headline: "Alışkanlık<br><span class='gradient-word'>Kazan.</span>", sub: "Finansal başarı bir sprint değil, maratondur. Süreklilik kazandırır.", type: "stat", label: "Birikim Serisi", val: "15 Hafta", icon: "🎯", color: "#5EE7DF" }
];

// 10 adet ana tema belirledik, bunları 10 kez farklı başlıklarla türeterek 100'e tamamlayacağız.
// Gerçek hayatta 100 farklı obje yazılır ama burada jeneratör mantığını kuruyoruz.

const htmlTemplate = (data) => `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #000; width: 1080px; height: 1350px; overflow: hidden; }
        .canvas { width: 1080px; height: 1350px; background: #050505; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
        .blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.45; z-index: 0; }
        .blob-1 { width: 900px; height: 900px; top: -200px; right: -200px; background: linear-gradient(135deg, ${data.color}, #1fa2ff); }
        .blob-2 { width: 800px; height: 800px; bottom: -200px; left: -200px; background: linear-gradient(135deg, #1fa2ff, ${data.color}); }
        .content-container { width: 900px; z-index: 10; display: flex; flex-direction: column; height: 100%; padding-top: 100px; }
        .header { display: flex; align-items: center; gap: 24px; margin-bottom: 80px; }
        .app-icon { width: 90px; height: 90px; border-radius: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .brand-name { font-size: 56px; font-weight: 800; letter-spacing: -1px; color: white; background: linear-gradient(90deg, #5EE7DF 0%, #4facfe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .text-section { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 60px; }
        .eyebrow { display: flex; align-items: center; gap: 16px; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: ${data.color}; text-transform: uppercase; margin-bottom: 24px; }
        .eyebrow::before { content: ''; width: 40px; height: 3px; background: ${data.color}; display: block; }
        .main-headline { font-size: 100px; font-weight: 800; line-height: 0.95; letter-spacing: -3px; color: white; }
        .gradient-word { background: linear-gradient(to right, ${data.color}, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sub-text { margin-top: 30px; font-size: 32px; color: rgba(255,255,255,0.7); line-height: 1.4; max-width: 800px; }
        .card { width: 100%; padding: 60px; background: rgba(25, 25, 25, 0.4); backdrop-filter: blur(60px); border: 1px solid rgba(255,255,255,0.08); border-radius: 60px; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6); display: flex; flex-direction: row; align-items: center; justify-content: space-between; margin-top: auto; margin-bottom: 120px; }
        .card-stat { display: flex; flex-direction: column; gap: 10px; }
        .stat-val { font-size: 72px; font-weight: 800; color: white; }
        .stat-label { color: ${data.color}; font-size: 24px; font-weight: 700; }
        .icon-box { font-size: 100px; }
        /* Push Style Overrides */
        .push-mode { border-radius: 40px; padding: 40px; gap: 30px; justify-content: flex-start; }
        .push-icon-box { width: 80px; height: 80px; background: ${data.color}; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .push-body { flex:1; }
    </style>
</head>
<body>
    <div class="canvas">
        <div class="blob blob-1"></div><div class="blob blob-2"></div>
        <div class="content-container">
            <div class="header"><img src="images/AppIcon.png" class="app-icon"><span class="brand-name">VYNTO</span></div>
             <div class="text-section"><div class="eyebrow">${data.eyebrow}</div><div class="main-headline">${data.headline}</div><p class="sub-text">${data.sub}</p></div>
            
            ${data.type === 'push' ? `
            <div class="card push-mode">
                <div class="push-icon-box">${data.icon}</div>
                <div class="push-body">
                    <div style="font-size:24px; font-weight:800; color:white; margin-bottom:5px;">${data.title}</div>
                    <div style="font-size:28px; color:#ccc; font-weight:500;">${data.msg}</div>
                </div>
            </div>
            ` : `
            <div class="card">
                <div class="card-stat"><div class="stat-label">${data.label || 'Durum'}</div><div class="stat-val">${data.val}</div></div>
                <div class="icon-box">${data.icon}</div>
            </div>
            `}
        </div>
    </div>
</body>
</html>
`;

// 100 adet post türetelim
for (let i = 0; i < 100; i++) {
    const baseTheme = themes[i % themes.length];
    const postData = {
        ...baseTheme,
        eyebrow: `${baseTheme.eyebrow} #${i + 59}`, // Takip için numara ekleyelim
    };

    const fileName = `render_p${i + 59}.html`;
    fs.writeFileSync(path.join(__dirname, fileName), htmlTemplate(postData));
}

console.log('100 adet HTML dosyası başarıyla oluşturuldu!');
