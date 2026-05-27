import { Building2, Camera, Map, ParkingSquare, QrCode, Route } from 'lucide-react';
import otoparkImage from '../assets/otoparkimg.jpg';
import { useLanguage } from '../hooks/useLanguage';

const sectorItems = [
  {
    titleKey: 'sector.parking.title',
    tagKey: 'sector.parking.tag',
    descKey: 'sector.parking.desc',
    image: otoparkImage,
  },
  {
    titleKey: 'sector.hospital.title',
    tagKey: 'sector.hospital.tag',
    descKey: 'sector.hospital.desc',
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    titleKey: 'sector.mall.title',
    tagKey: 'sector.mall.tag',
    descKey: 'sector.mall.desc',
    image:
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1400&q=80',
  },
];

const featureItems = [
  {
    icon: Map,
    titleKey: 'features.map.title',
    descKey: 'features.map.desc',
    metaKeys: ['features.map.meta1', 'features.map.meta2'],
  },
  {
    icon: QrCode,
    titleKey: 'features.qr.title',
    descKey: 'features.qr.desc',
    metaKeys: ['features.qr.meta1', 'features.qr.meta2'],
  },
  {
    icon: Route,
    titleKey: 'features.route.title',
    descKey: 'features.route.desc',
    metaKeys: ['features.route.meta1', 'features.route.meta2'],
  },
  {
    icon: Camera,
    titleKey: 'features.camera.title',
    descKey: 'features.camera.desc',
    metaKeys: ['features.camera.meta1', 'features.camera.meta2'],
  },
  {
    icon: ParkingSquare,
    titleKey: 'features.parking.title',
    descKey: 'features.parking.desc',
    metaKeys: ['features.parking.meta1', 'features.parking.meta2'],
  },
  {
    icon: Building2,
    titleKey: 'features.admin.title',
    descKey: 'features.admin.desc',
    metaKeys: ['features.admin.meta1', 'features.admin.meta2'],
  },
];

export default function Features() {
  const { t } = useLanguage();

  return (
    <>
      <section className="bg-[#060708] px-6 py-32 lg:px-10" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c4b5fd]">{t('sectors.eyebrow')}</p>
              <h2 className="mt-5 font-display text-5xl font-extrabold tracking-[-0.055em] text-[#f5f3ef] md:text-6xl">
                {t('sectors.title')}
              </h2>
            </div>
            <p className="max-w-md text-base font-light leading-8 text-[#c5c5d6]">{t('sectors.desc')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-12 md:auto-rows-[360px]">
            {sectorItems.map((sector, index) => (
              <article
                key={sector.titleKey}
                className={`group relative overflow-hidden rounded-xl bg-[#121315] ${
                  index === 0 ? 'md:col-span-12' : index === 1 ? 'md:col-span-8' : 'md:col-span-4'
                }`}
              >
                <img
                  alt={t(sector.titleKey)}
                  className="h-full w-full object-cover opacity-38 grayscale transition-transform duration-700 group-hover:scale-105"
                  src={sector.image}
                />
                <div className="absolute inset-0 bg-[#060708]/52" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[#060708]/62" />
                <div className="absolute bottom-10 left-10 max-w-xl">
                  <span className="rounded-lg bg-[#6366F1]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4b5fd]">
                    {t(sector.tagKey)}
                  </span>
                  <h3 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.045em] text-[#f5f3ef]">
                    {t(sector.titleKey)}
                  </h3>
                  <p className="mt-4 max-w-md text-sm font-light leading-7 text-[#c5c5d6]">{t(sector.descKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#060708] px-6 py-28 lg:px-10" id="solutions">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {featureItems.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.titleKey}
                  className="group rounded-xl bg-[#121315] p-10 transition-colors duration-300 hover:bg-[#1f2021]"
                >
                  <Icon className="h-9 w-9 text-[#6366F1]" />
                  <h3 className="mt-8 font-display text-2xl font-extrabold tracking-[-0.04em] text-[#f5f3ef]">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="mt-5 text-sm font-light leading-7 text-[#c5c5d6]">{t(feature.descKey)}</p>
                  <div className="mt-8 space-y-3 pt-6">
                    {feature.metaKeys.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42 transition-colors group-hover:text-[#c4b5fd]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c4b5fd]" />
                        {t(item)}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
