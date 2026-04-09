import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'tr';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'hero.badge': 'Indoor Navigation Platform',
    'hero.title': 'You do not get lost indoors.',
    'hero.desc':
      'Built for complex campuses, hospitals, mixed-use structures, and connected parking operations. BuLocation brings spatial guidance, QR positioning, and operational clarity into one platform.',
    'hero.btn.primary': 'Explore platform',
    'hero.btn.secondary': 'View flow',
    'hero.stats.1': 'active sites',
    'hero.stats.2': 'wayfinding events',
    'hero.stats.3': 'position accuracy',
    'hero.stats.4': 'operations continuity',
    'hiw.eyebrow': 'Indoor navigation stack',
    'hiw.title': 'How it works',
    'hiw.step1.title': 'Infrastructure integration',
    'hiw.step1.desc':
      'Floor plans, connector nodes, parking zones, and QR anchors are mapped into a single navigable model.',
    'hiw.step2.title': 'Digital mapping',
    'hiw.step2.desc':
      'Each floor becomes a versioned operational map with nodes, routes, camera zones, and mobile-ready coordinates.',
    'hiw.step3.title': 'Access guidance',
    'hiw.step3.desc':
      'Users scan once, resolve context instantly, and continue with route guidance across floors, buildings, and facilities.',
    'feat.eyebrow': 'Editorial capabilities',
    'feat.title': 'Capabilities built with architectural precision',
    'feat.subtitle':
      'A single spatial backbone for indoor navigation, parking operations, QR positioning, and real-time visibility.',
    'feat.1.title': 'Operational campuses',
    'feat.1.desc': 'Model institutions, sites, buildings, floors, and parking facilities inside one consistent hierarchy.',
    'feat.2.title': 'Accessible routing',
    'feat.2.desc': 'Support accessible connectors, ramps, elevators, and restricted paths without duplicating maps.',
    'feat.3.title': 'Versioned maps',
    'feat.3.desc': 'Publish and archive floor plans as controlled map versions with editable nodes and route connections.',
    'feat.4.title': 'Cross-building navigation',
    'feat.4.desc': 'Guide visitors from parking structures to hospital entrances, clinics, exits, and vertical connectors.',
    'feat.5.title': 'Live occupancy',
    'feat.5.desc': 'Use camera zones and SignalR updates to surface parking availability in real time.',
    'feat.6.title': 'Secure administration',
    'feat.6.desc': 'Manage facilities, maps, users, and QR-linked points through a controlled operational backoffice.',
    'solutions.eyebrow': 'Solution surfaces',
    'solutions.title': 'Institutions and parking operations',
    'solutions.tab.institutions': 'Institutions',
    'solutions.tab.parking': 'Parking',
    'institutions.1.title': 'Hospitals',
    'institutions.1.desc':
      'Connect emergency entrances, outpatient blocks, parking structures, elevators, and internal clinics under one navigable system.',
    'institutions.2.title': 'Campuses',
    'institutions.2.desc':
      'Guide students and visitors between faculties, service buildings, and shared parking areas with versioned floor maps.',
    'institutions.3.title': 'Mixed-use buildings',
    'institutions.3.desc':
      'Coordinate offices, retail, residential towers, and visitor circulation through a common indoor navigation backbone.',
    'parking.1.title': 'Live occupancy control',
    'parking.1.desc':
      'Track parking areas by zone, camera, and floor so mobile guidance reflects real operational availability.',
    'parking.2.title': 'Vehicle return journeys',
    'parking.2.desc':
      'Store the exact parking node and route users back to their vehicles from any scanned indoor point.',
    'parking.3.title': 'Operational oversight',
    'parking.3.desc':
      'Use the admin panel for map publishing, camera zoning, parking segmentation, and QR distribution without breaking hierarchy.',
    'cta.title': 'Digitize your building',
    'cta.primary': 'Contact us',
    'cta.secondary': 'Technical catalog',
    'about.eyebrow': 'Who we are',
    'about.title': 'Built for indoor navigation as a core system',
    'about.1.title': 'Spatial-first architecture',
    'about.1.desc':
      'We design digital navigation systems around real buildings, real visitor movement, and operational constraints instead of decorative map layers.',
    'about.2.title': 'Operational deployment',
    'about.2.desc':
      'The platform is structured for institutions that need maintainable floor maps, connected parking flows, and controlled admin tooling.',
    'about.3.title': 'Long-term system thinking',
    'about.3.desc':
      'Our focus is not a single parking demo. It is a durable indoor navigation backbone for hospitals, campuses, airports, retail, and mixed-use sites.',
    'services.eyebrow': 'Service catalog',
    'services.title': 'Indoor navigation systems we deploy',
    'services.desc':
      'Each deployment is adapted to the building model, visitor flow, and operational topology of the institution.',
    'services.contact': 'Contact us.',
    'services.1.title': 'Hospital + parking navigation system',
    'services.1.desc':
      'A connected guidance system that routes visitors from parking structures to emergency, outpatient, clinic, and internal building destinations.',
    'services.2.title': 'Airport parking system',
    'services.2.desc':
      'A parking-focused navigation deployment for airport structures, terminal access, return journeys, and passenger circulation.',
    'services.3.title': 'Hospital indoor navigation system',
    'services.3.desc':
      'Indoor wayfinding designed for hospitals with multiple blocks, floors, elevators, restricted corridors, and visitor-heavy circulation.',
    'services.4.title': 'Shopping mall indoor navigation system',
    'services.4.desc':
      'A retail-oriented navigation setup for mall entrances, store corridors, vertical movement, and mixed-use circulation paths.',
    'services.5.title': 'Parking guidance system',
    'services.5.desc':
      'A live parking operation layer with QR-based positioning, map-based spot guidance, and camera-driven occupancy updates.',
    'services.6.title': 'AVM + parking integrated system',
    'services.6.desc':
      'An integrated deployment that connects indoor mall navigation with attached parking operations and visitor return flows.',
    'footer.rights': 'all rights reserved.',
    'footer.developed': 'Developed by',
  },
  tr: {
    'nav.services': 'Hizmetlerimiz',
    'nav.about': 'Hakkimizda',
    'nav.contact': 'Iletisim',
    'hero.badge': 'YENİ NESİL NAVİGASYON PLATFORMU',
    'hero.title': 'Navigasyon, Yeniden Tanımlandı',
    'hero.desc':
      'Karmaşık binalar, büyük tesisler ve otoparklar için tasarlandı.',
    'hero.btn.primary': 'SİSTEMİ KEŞFEDİN',
    'hero.btn.secondary': 'Demo AKIŞINI İNCELE',
    'hero.stats.1': 'aktif saha',
    'hero.stats.2': 'yonlendirme olayi',
    'hero.stats.3': 'konum hassasiyeti',
    'hero.stats.4': 'operasyon surekliligi',
    'hiw.eyebrow': 'BuLocation',
    'hiw.title': 'Nasil calisir?',
    'hiw.step1.title': 'Altyapi entegrasyonu',
    'hiw.step1.desc':
      'QR modelleri ile donatılmış haritaları, mobil uygulama üzerinden kolayca takip edilebilir hale getirir.',
    'hiw.step2.title': 'Dijital haritalandirma',
    'hiw.step2.desc':
      'Her kat; dugumleri, rotalari, kamera bolgeleri ve mobil koordinatlariyla versiyonlu bir operasyon haritasina donusur.',
    'hiw.step3.title': 'Kullanici erisimi',
    'hiw.step3.desc':
      'Kullanici tek bir QR okutmayla baglami cozer ve katlar, binalar ve tesisler arasinda rota almaya baslar.',
    'feat.eyebrow': 'Mimari hassasiyet',
    'feat.title': 'Mimari hassasiyetle gelistirilen ozellikler',
    'feat.subtitle':
      'Indoor navigation, otopark operasyonu, QR konumlama ve canli izleme icin tek bir mekansal omurga.',
    'feat.1.title': 'Kurumsal hiyerarsi',
    'feat.1.desc': 'Kurum, yerleske, bina, kat ve otopark tesislerini tek bir veri modelinde yonetin.',
    'feat.2.title': 'Erisilebilir rota',
    'feat.2.desc': 'Rampa, asansor, kisitli gecis ve erisilebilir baglantilari ayni harita ustunde yonetin.',
    'feat.3.title': 'Isi haritalari',
    'feat.3.desc': 'Kat krokilerini yayina alin, arsivleyin ve versiyonlu editor yapisiyla kontrollu sekilde yonetin.',
    'feat.4.title': 'Coklu bina gecisi',
    'feat.4.desc': 'Kullaniciyi otoparktan hastane girisine, klinikten cikisa kadar bagli bir rota ile yonlendirin.',
    'feat.5.title': 'Canli doluluk',
    'feat.5.desc': 'Kamera bolgeleri ve SignalR yayini ile park dolulugunu gercek zamanli olarak yansitin.',
    'feat.6.title': 'Anlik durum merkezi',
    'feat.6.desc': 'Harita, QR noktasi, kullanici ve operasyon akisini tek yonetim panelinde kontrol edin.',
    'solutions.eyebrow': 'Cozum alanlari',
    'solutions.title': 'Kurumlar ve otopark operasyonlari',
    'solutions.tab.institutions': 'Kurumlar',
    'solutions.tab.parking': 'Otoparklar',
    'institutions.1.title': 'Hastaneler',
    'institutions.1.desc':
      'Acil girisler, poliklinik bloklari, asansorler ve bagli otopark yapilari tek yonlendirme katmaninda toplanir.',
    'institutions.2.title': 'Kampusler',
    'institutions.2.desc':
      'Fakulteler, ortak yapilar ve kampus ici otoparklar arasinda ziyaretci ve ogrenci akisini haritalandirin.',
    'institutions.3.title': 'Karma yapilar',
    'institutions.3.desc':
      'Ofis, avm, rezidans ve servis alanlarinin dolasimini ortak indoor navigation omurgasiyla yonetin.',
    'parking.1.title': 'Canli doluluk kontrolu',
    'parking.1.desc':
      'Park alanlarini kat, kamera ve bolge seviyesinde izleyin; mobil rota her an guncel kalsin.',
    'parking.2.title': 'Araca geri donus',
    'parking.2.desc':
      'Kullanicinin park ettigi dugumu saklayin ve herhangi bir ic mekan noktasindan aracina geri goturun.',
    'parking.3.title': 'Operasyon denetimi',
    'parking.3.desc':
      'Harita yayini, kamera zonelari, park segmentasyonu ve QR dagitimini hiyerarsiyi bozmadan yonetin.',
    'cta.title': 'Binanizi dijitallestirin',
    'cta.primary': 'Bizimle iletisime gecin',
    'cta.secondary': 'Teknik katalog',
    'about.eyebrow': 'Hakkimizda',
    'about.title': 'Indoor navigation odakli sistem mimarisi',
    'about.1.title': 'Mekansal omurga',
    'about.1.desc':
      'Sistemlerimizi dekoratif harita katmanlari yerine gercek bina yapisi, ziyaretci akisi ve operasyon ihtiyaclari uzerine kuruyoruz.',
    'about.2.title': 'Kurumsal operasyon',
    'about.2.desc':
      'Platform; versiyonlu kroki yonetimi, bagli otopark akisleri ve kontrollu yonetim paneli gerektiren kurumlar icin tasarlandi.',
    'about.3.title': 'Uzun omurlu yaklasim',
    'about.3.desc':
      'Hedefimiz tek seferlik bir otopark demosu degil; hastane, kampus, havaalani, avm ve karma yapilar icin kalici bir indoor navigation altyapisidir.',
    'services.eyebrow': 'Hizmet katalogu',
    'services.title': 'Kurdugumuz indoor navigation sistemleri',
    'services.desc':
      'Her kurulum; bina modeline, ziyaretci hareketine ve kurumun operasyon yapisina gore uyarlanir.',
    'services.contact': 'Bizimle iletisime gecin.',
    'services.1.title': 'Hastane + otopark navigasyon sistemi',
    'services.1.desc':
      'Ziyaretciyi otoparktan acil girise, poliklinige, klinik bloklara ve ic mekan hedeflerine bagli rota ile ulastiran sistem.',
    'services.2.title': 'Havaalani otopark sistemi',
    'services.2.desc':
      'Terminal erisimi, geri donus rotalari ve yolcu dolasimi icin tasarlanmis otopark odakli yonlendirme kurulumu.',
    'services.3.title': 'Hastane indoor navigation sistemi',
    'services.3.desc':
      'Cok bloklu hastaneler, asansorler, kisitli koridorlar ve yogun ziyaretci akisi icin gelistirilmis ic mekan yonlendirme sistemi.',
    'services.4.title': 'AVM indoor navigation sistemi',
    'services.4.desc':
      'Magaza koridorlari, giris alanlari, dikey dolasim ve karma kullanim akslari icin kurgulanmis avm yonlendirme sistemi.',
    'services.5.title': 'Otopark yonlendirme sistemi',
    'services.5.desc':
      'QR tabanli konumlama, canli doluluk ve harita uzerinden park noktasi yonlendirmesi sunan operasyon katmani.',
    'services.6.title': 'AVM + otopark entegre sistem',
    'services.6.desc':
      'AVM ic mekan yonlendirmesi ile bagli otopark operasyonunu ve ziyaretcinin geri donus akisini tek sistemde birlestiren kurulum.',
    'footer.rights': 'tum haklari saklidir.',
    'footer.developed': 'Gelistirici',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr');

  const t = (key: string): string => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
