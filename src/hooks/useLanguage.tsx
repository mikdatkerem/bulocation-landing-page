import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'tr';

type TranslationMap = Record<string, Record<string, string>>;

const translations: TranslationMap = {
  en: {
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'hero.title.line1': 'Indoor',
    'hero.title.line2': 'Navigation',
    'hero.desc':
      'Bulocation brings maps, QR-based location entry, cross-floor routing, and operational management into one platform for hospitals, campuses, malls, and large indoor spaces.',
    'hero.btn.primary': 'Explore system',
    'hero.btn.secondary': 'View demo flow',
    'hero.node.parking': 'B2 Parking',
    'hero.node.entry': 'Main Entrance',
    'hero.node.department': 'Dermatology',
    'hero.node.elevator': 'Elevator A',
    'hero.cluster.title': 'Map cluster 04',
    'hero.cluster.desc': 'Published route graph active',
    'hero.qr': 'QR based entry',
    'sectors.eyebrow': 'Use cases',
    'sectors.title': 'Spatial environments',
    'sectors.desc':
      'Bulocation turns complex physical spaces where GPS fails into a manageable digital navigation layer.',
    'sector.parking.title': 'Parking operations',
    'sector.parking.tag': 'Parking layer',
    'sector.parking.desc':
      'Live occupancy, parking spot QR codes, and building entrance guidance are managed in one flow.',
    'sector.hospital.title': 'Hospitals',
    'sector.hospital.tag': 'Life critical',
    'sector.hospital.desc':
      'Outpatient clinics, emergency areas, parking structures, and internal departments connect under one routing graph.',
    'sector.mall.title': 'Malls and mixed-use buildings',
    'sector.mall.tag': 'Commerce',
    'sector.mall.desc':
      'Visitors, stores, service points, and parking circulation are managed through the same spatial system.',
    'features.map.title': 'Dynamic map management',
    'features.map.desc':
      'Floor plans, nodes, connections, and published map versions are managed from one operational panel.',
    'features.map.meta1': 'Multi-floor graph',
    'features.map.meta2': 'Versioned publish',
    'features.qr.title': 'Instant QR location',
    'features.qr.desc':
      'Users can open their exact floor and starting point through QR without installing an app.',
    'features.qr.meta1': 'Zero install',
    'features.qr.meta2': 'Web + mobile',
    'features.route.title': 'Cross-floor routing engine',
    'features.route.desc':
      'Indoor destinations are routed through elevators, stairs, ramps, and connector nodes.',
    'features.route.meta1': 'Connector node',
    'features.route.meta2': 'Accessible route',
    'features.camera.title': 'Camera-zone integration',
    'features.camera.desc':
      'Camera zones are bound to polygon areas on the map and can produce live operational data.',
    'features.camera.meta1': 'Polygon zone',
    'features.camera.meta2': 'SignalR live',
    'features.parking.title': 'Parking operation layer',
    'features.parking.desc':
      'Parking works as a module of the indoor navigation platform, producing occupancy and guidance data.',
    'features.parking.meta1': 'Floor occupancy',
    'features.parking.meta2': 'Parking node',
    'features.admin.title': 'Enterprise backoffice',
    'features.admin.desc':
      'Organizations, sites, buildings, floors, users, and roles are controlled under one structure.',
    'features.admin.meta1': 'RBAC',
    'features.admin.meta2': 'Admin editor',
    'flow.eyebrow': 'Implementation flow',
    'flow.title': 'Execution path',
    'flow.1.title': 'Map definition',
    'flow.1.desc':
      'Organization, site, building, floor, and floor plan hierarchy is defined from the operations panel.',
    'flow.2.title': 'Node matrix',
    'flow.2.desc':
      'Waypoints, entrances, parking areas, and route connections are processed through the editor.',
    'flow.3.title': 'QR location entry',
    'flow.3.desc':
      'When a user scans a QR code, the correct floor and starting point open in browser or mobile.',
    'flow.4.title': 'Route publishing',
    'flow.4.desc':
      'Single-floor or cross-floor routes are generated from the published map graph.',
    'about.eyebrow': 'About',
    'about.title': 'We turn indoor spaces into manageable navigation infrastructure.',
    'about.1.title': 'Infrastructure approach',
    'about.1.desc':
      'Bulocation treats maps as publishable and routable facility graphs, not static visuals.',
    'about.2.title': 'Operational control',
    'about.2.desc':
      'Institution teams manage floor plans, nodes, connections, camera zones, and publishing flows from the backoffice.',
    'about.3.title': 'Scalable model',
    'about.3.desc':
      'The organization, site, building, and floor hierarchy adapts to large facilities as they grow.',
    'cta.title.line1': 'Position your indoor',
    'cta.title.line2': 'infrastructure.',
    'cta.desc':
      'Let us select a pilot area, configure the map and QR flow, and measure the system in real use.',
    'cta.primary': 'Contact us',
    'footer.desc': 'Indoor navigation infrastructure.',
    'footer.services': 'Services',
    'footer.about': 'About',
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
    'services.6.title': 'Mall + parking integrated system',
    'services.6.desc':
      'An integrated deployment that connects indoor mall navigation with attached parking operations and visitor return flows.',
  },
  tr: {
    'nav.services': 'Hizmetlerimiz',
    'nav.about': 'Hakkımızda',
    'nav.contact': 'İletişim',
    'hero.title.line1': 'İç mekan',
    'hero.title.line2': 'Navigasyonu',
    'hero.desc':
      'Bulocation; hastaneler, kampüsler, AVM’ler ve büyük kapalı alanlar için harita, QR konum açılışı, katlar arası rota ve operasyon yönetimini tek platformda toplar.',
    'hero.btn.primary': 'Sistemi keşfedin',
    'hero.btn.secondary': 'Demo akışını incele',
    'hero.node.parking': 'B2 Otopark',
    'hero.node.entry': 'Ana Giriş',
    'hero.node.department': 'Dermatoloji',
    'hero.node.elevator': 'Asansör A',
    'hero.cluster.title': 'Harita kümesi 04',
    'hero.cluster.desc': 'Yayınlanmış rota grafiği aktif',
    'hero.qr': 'QR tabanlı başlangıç',
    'sectors.eyebrow': 'Kullanım alanları',
    'sectors.title': 'Mekansal ortamlar',
    'sectors.desc':
      'Bulocation, GPS’in çalışmadığı karmaşık fiziksel alanları yönetilebilir bir dijital navigasyon katmanına dönüştürür.',
    'sector.parking.title': 'Otopark operasyonları',
    'sector.parking.tag': 'Otopark katmanı',
    'sector.parking.desc':
      'Canlı doluluk, park noktası QR’ları ve bina girişlerine yönlendirme aynı akışta yönetilir.',
    'sector.hospital.title': 'Hastaneler',
    'sector.hospital.tag': 'Kritik kullanım',
    'sector.hospital.desc':
      'Poliklinik, acil, otopark ve klinik hedefleri tek yönlendirme grafiğinde birleşir.',
    'sector.mall.title': 'AVM ve karma yapılar',
    'sector.mall.tag': 'Ticari alan',
    'sector.mall.desc':
      'Ziyaretçi, mağaza, hizmet noktası ve otopark akışı aynı sistemden yönetilir.',
    'features.map.title': 'Dinamik harita yönetimi',
    'features.map.desc':
      'Kat planları, node’lar, bağlantılar ve yayınlanan harita sürümleri tek panelden yönetilir.',
    'features.map.meta1': 'Çok katlı graph',
    'features.map.meta2': 'Versiyonlu yayın',
    'features.qr.title': 'QR ile anında konum',
    'features.qr.desc':
      'Kullanıcı uygulama kurmadan QR üzerinden bulunduğu kat ve başlangıç noktasını açabilir.',
    'features.qr.meta1': 'Kurulumsuz erişim',
    'features.qr.meta2': 'Web + mobil',
    'features.route.title': 'Katlar arası rota motoru',
    'features.route.desc':
      'Asansör, merdiven, rampa ve geçiş noktaları üzerinden bina içi hedeflere rota oluşturulur.',
    'features.route.meta1': 'Bağlantı node’u',
    'features.route.meta2': 'Erişilebilir rota',
    'features.camera.title': 'Kamera-zone entegrasyonu',
    'features.camera.desc':
      'Kamera bölgeleri harita üzerindeki polygon alanlara bağlanır ve canlı operasyon verisi üretebilir.',
    'features.camera.meta1': 'Polygon zone',
    'features.camera.meta2': 'Canlı SignalR',
    'features.parking.title': 'Otopark operasyonu',
    'features.parking.desc':
      'Otopark, indoor navigation platformunun parçası olarak doluluk ve yönlendirme üretir.',
    'features.parking.meta1': 'Kat doluluğu',
    'features.parking.meta2': 'Park node’u',
    'features.admin.title': 'Kurumsal backoffice',
    'features.admin.desc':
      'Organizasyon, yerleşke, bina, kat, kullanıcı ve rol yönetimi aynı çatı altında toplanır.',
    'features.admin.meta1': 'Rol yönetimi',
    'features.admin.meta2': 'Harita editörü',
    'flow.eyebrow': 'Uygulama akışı',
    'flow.title': 'Kurulum yolu',
    'flow.1.title': 'Harita tanımı',
    'flow.1.desc':
      'Kurum, yerleşke, bina, kat ve kroki hiyerarşisi operasyon panelinden tanımlanır.',
    'flow.2.title': 'Node matrisi',
    'flow.2.desc':
      'Geçiş noktaları, girişler, otopark alanları ve bağlantılar editör üzerinden işlenir.',
    'flow.3.title': 'QR konum açılışı',
    'flow.3.desc':
      'Kullanıcı QR okuttuğunda doğru kat ve başlangıç noktası tarayıcı veya mobilde açılır.',
    'flow.4.title': 'Rota yayını',
    'flow.4.desc':
      'Tek katlı veya katlar arası rota yayınlanmış harita grafiği üzerinden oluşturulur.',
    'about.eyebrow': 'Hakkımızda',
    'about.title': 'Kapalı alanları yönetilebilir navigasyon altyapısına çeviriyoruz.',
    'about.1.title': 'Altyapı yaklaşımı',
    'about.1.desc':
      'Bulocation haritayı statik bir görsel değil, yayınlanabilir ve rotalanabilir bir tesis grafiği olarak ele alır.',
    'about.2.title': 'Operasyonel kontrol',
    'about.2.desc':
      'Kurum ekipleri kroki, node, bağlantı, kamera bölgesi ve yayın akışını backoffice üzerinden yönetir.',
    'about.3.title': 'Ölçeklenebilir model',
    'about.3.desc':
      'Organizasyon, yerleşke, bina ve kat hiyerarşisi büyük tesislerin büyümesine uyum sağlar.',
    'cta.title.line1': 'İç mekan altyapınızı',
    'cta.title.line2': 'konumlandırın.',
    'cta.desc':
      'Pilot alanınızı birlikte seçelim, harita ve QR akışını kurup gerçek kullanım üzerinden ölçelim.',
    'cta.primary': 'Bizimle iletişime geç',
    'footer.desc': 'İç mekan navigasyon altyapısı.',
    'footer.services': 'Hizmetlerimiz',
    'footer.about': 'Hakkımızda',
    'services.eyebrow': 'Hizmet kataloğu',
    'services.title': 'Kurduğumuz indoor navigation sistemleri',
    'services.desc':
      'Her kurulum; bina modeline, ziyaretçi hareketine ve kurumun operasyon yapısına göre uyarlanır.',
    'services.contact': 'Bizimle iletişime geçin.',
    'services.1.title': 'Hastane + otopark navigasyon sistemi',
    'services.1.desc':
      'Ziyaretçiyi otoparktan acil girişe, polikliniğe, klinik bloklara ve iç mekan hedeflerine bağlı rota ile ulaştıran sistem.',
    'services.2.title': 'Havaalanı otopark sistemi',
    'services.2.desc':
      'Terminal erişimi, geri dönüş rotaları ve yolcu dolaşımı için tasarlanmış otopark odaklı yönlendirme kurulumu.',
    'services.3.title': 'Hastane indoor navigation sistemi',
    'services.3.desc':
      'Çok bloklu hastaneler, asansörler, kısıtlı koridorlar ve yoğun ziyaretçi akışı için geliştirilmiş iç mekan yönlendirme sistemi.',
    'services.4.title': 'AVM indoor navigation sistemi',
    'services.4.desc':
      'Mağaza koridorları, giriş alanları, dikey dolaşım ve karma kullanım aksları için kurgulanmış AVM yönlendirme sistemi.',
    'services.5.title': 'Otopark yönlendirme sistemi',
    'services.5.desc':
      'QR tabanlı konumlama, canlı doluluk ve harita üzerinden park noktası yönlendirmesi sunan operasyon katmanı.',
    'services.6.title': 'AVM + otopark entegre sistem',
    'services.6.desc':
      'AVM iç mekan yönlendirmesi ile bağlı otopark operasyonunu ve ziyaretçinin geri dönüş akışını tek sistemde birleştiren kurulum.',
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

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
