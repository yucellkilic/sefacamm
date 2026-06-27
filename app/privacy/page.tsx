import type { Metadata } from 'next';
import { Shield, Eye, Database, Lock, Globe, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Sefa Çam Blog',
  description: 'Sefa Çam Blog gizlilik politikası. KVKK ve GDPR uyumlu kişisel veri işleme ilkeleri.',
  alternates: { canonical: 'https://sefacam.com/privacy' },
};

const sections = [
  {
    icon: Database,
    title: 'Toplanan Veriler',
    content: `Bu blog sitesinde aşağıdaki veriler toplanabilir:

• **İletişim formu:** Ad, soyad, e-posta adresi ve mesaj içeriği
• **Bülten aboneliği:** E-posta adresi
• **Yorumlar:** Ad, e-posta adresi ve yorum içeriği
• **Analitik veriler:** Ziyaret istatistikleri (anonim olarak)
• **Teknik veriler:** IP adresi, tarayıcı türü, işletim sistemi (otomatik)`,
  },
  {
    icon: Eye,
    title: 'Veri Kullanımı',
    content: `Toplanan veriler şu amaçlarla kullanılır:

• Blog hizmetlerini sağlamak ve iyileştirmek
• İletişim formları aracılığıyla sizinle iletişim kurmak
• Bülten aboneliği kapsamında yeni içerikler hakkında bilgi vermek
• Site güvenliğini sağlamak ve kötüye kullanımı önlemek
• Ziyaretçi deneyimini analiz etmek ve iyileştirmek

**Verileriniz hiçbir şekilde satılmaz veya üçüncü taraflarla ticari amaçla paylaşılmaz.**`,
  },
  {
    icon: Shield,
    title: 'Veri Güvenliği',
    content: `Verilerinizin güvenliği için aşağıdaki önlemler alınmıştır:

• Tüm veriler şifreli (HTTPS) bağlantı üzerinden iletilir
• Veritabanı Supabase altyapısında güvenli biçimde saklanır
• Row Level Security (RLS) politikalarıyla yetkisiz erişim engellenir
• Düzenli güvenlik güncellemeleri yapılır`,
  },
  {
    icon: Lock,
    title: 'KVKK / GDPR Hakları',
    content: `6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve GDPR kapsamında sahip olduğunuz haklar:

• **Erişim hakkı:** Hakkınızda tutulan verilere erişim talep edebilirsiniz
• **Düzeltme hakkı:** Hatalı verilerin düzeltilmesini isteyebilirsiniz
• **Silme hakkı:** "Unutulma hakkı" kapsamında verilerinizin silinmesini talep edebilirsiniz
• **İtiraz hakkı:** Veri işlemeye itiraz edebilirsiniz
• **Taşınabilirlik hakkı:** Verilerinizi yapılandırılmış formatta talep edebilirsiniz

Bu haklarınızı kullanmak için **sefacm18@gmail.com** adresine e-posta gönderebilirsiniz.`,
  },
  {
    icon: Globe,
    title: 'Çerezler (Cookies)',
    content: `Bu site minimal düzeyde çerez kullanır:

• **Zorunlu çerezler:** Sitenin temel işlevleri için gereklidir
• **Analitik çerezler:** Ziyaretçi istatistiklerini anonim olarak toplar
• **Tercih çerezleri:** Kullanıcı tercihlerini hatırlamak için kullanılır

Tarayıcı ayarlarından çerezleri devre dışı bırakabilirsiniz; ancak bu bazı işlevleri etkileyebilir.`,
  },
  {
    icon: Mail,
    title: 'İletişim',
    content: `Gizlilik politikamız hakkında sorularınız için:

**E-posta:** sefacm18@gmail.com

Talepleriniz 30 gün içinde yanıtlanacaktır.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-text-primary">Gizlilik Politikası</h1>
          <p className="text-text-secondary">
            Son güncelleme: Ocak 2025 · KVKK ve GDPR uyumlu
          </p>
        </header>

        {/* Intro */}
        <div className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <p className="text-text-secondary leading-relaxed">
            Sefa Çam Blog olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı
            taahhüt ediyoruz. Bu politika, hangi verileri topladığımızı, nasıl kullandığımızı
            ve haklarınızı açıklamaktadır.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={index} className="rounded-xl border border-border bg-surface p-6 md:p-8">
              <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-text-primary">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                {section.title}
              </h2>
              <div className="prose prose-invert prose-sm max-w-none">
                {section.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="font-semibold text-text-primary">
                        {line.slice(2, -2)}
                      </p>
                    );
                  }
                  if (line.startsWith('• ')) {
                    const parts = line.slice(2).split(/\*\*(.*?)\*\*/);
                    return (
                      <p key={i} className="text-text-secondary flex gap-2">
                        <span className="mt-1 text-primary shrink-0">•</span>
                        <span>
                          {parts.map((part, pi) =>
                            pi % 2 === 1 ? (
                              <strong key={pi} className="text-text-primary font-semibold">{part}</strong>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      </p>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return (
                    <p key={i} className="text-text-secondary leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
