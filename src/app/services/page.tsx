"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Users, Globe, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { applicationsTranslations } from "@/lib/language";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CircularNavbar from "@/components/circular-navbar";

interface Service {
  id: string;
  icon: React.ReactNode;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  duration: string;
  durationAr: string;
  price: string;
  features: string[];
  featuresAr: string[];
}

const SERVICES: Service[] = [
  {
    id: "resume",
    icon: <FileText size={24} />,
    name: "Resume Review + Call",
    nameAr: "مراجعة السيرة الذاتية + مكالمة",
    description: "Get expert feedback on your resume with a personalized consultation call",
    descriptionAr: "احصل على ملاحظات خبير على سيرتك الذاتية مع مكالمة استشارية مخصصة",
    duration: "30 minutes",
    durationAr: "٣٠ دقيقة",
    price: "SAR 200",
    features: [
      "Comprehensive resume review",
      "ATS optimization tips",
      "Content and structure feedback",
      "30-minute personalized call",
      "Written feedback summary"
    ],
    featuresAr: [
      "مراجعة شاملة للسيرة الذاتية",
      "نصائح لتحسين ATS",
      "ملاحظات على المحتوى والبنية",
      "مكالمة مخصصة لمدة 30 دقيقة",
      "ملخص كتابي للملاحظات"
    ]
  },
  {
    id: "linkedin",
    icon: <Globe size={24} />,
    name: "LinkedIn Optimization + Call",
    nameAr: "تحسين ملف LinkedIn + مكالمة",
    description: "Optimize your LinkedIn profile to attract recruiters and opportunities",
    descriptionAr: "قم بتحسين ملفك الشخصي على LinkedIn لجذب القائمين على التوظيف والفرص",
    duration: "30 minutes",
    durationAr: "٣٠ دقيقة",
    price: "SAR 200",
    features: [
      "Profile headline optimization",
      "Compelling summary writing",
      "Experience section enhancement",
      "Skills and endorsements strategy",
      "30-minute strategy call"
    ],
    featuresAr: [
      "تحسين عنوان الملف الشخصي",
      "كتابة ملخص مقنع",
      "تحسين قسم الخبرة",
      "استراتيجية المهارات والتوصيات",
      "مكالمة استراتيجية لمدة 30 دقيقة"
    ]
  },
  {
    id: "interview",
    icon: <Users size={24} />,
    name: "Interview Preparation",
    nameAr: "التحضير للمقابلة",
    description: "Ace your interviews with expert coaching and practice sessions",
    descriptionAr: "انجح في مقابلاتك مع التدريب المتخصص وجلسات التمرين",
    duration: "45 minutes",
    durationAr: "٤٥ دقيقة",
    price: "SAR 300",
    features: [
      "Mock interview practice",
      "Behavioral question coaching",
      "Technical interview preparation",
      "Body language and delivery tips",
      "45-minute intensive session",
      "Post-session feedback document"
    ],
    featuresAr: [
      "تمرين مقابلة وهمية",
      "تدريب على أسئلة السلوك",
      "التحضير للمقابلة التقنية",
      "نصائح لغة الجسد والتقديم",
      "جلسة مكثفة لمدة 45 دقيقة",
      "وثيقة ملاحظات بعد الجلسة"
    ]
  }
];

export default function ServicesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = applicationsTranslations[language];
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleBookService = (serviceId: string) => {
    if (!user) {
      toast.error(language === "en" ? "Please sign in to book a service" : "يرجى تسجيل الدخول لحجز خدمة");
      router.push("/auth/talent/login");
      return;
    }

    // Navigate to the talent services page with the selected service
    router.push(`/talent/services?service=${serviceId}`);
  };

  return (
    <>
      <CircularNavbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
            {language === "en" ? "Professional Career Services" : "خدمات مهنية للتطوير الوظيفي"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {language === "en" 
              ? "Elevate your career with expert guidance. One-on-one sessions tailored to your goals."
              : "ارتقِ بمسيرتك المهنية مع إرشاد الخبراء. جلسات فردية مصممة خصيصًا لأهدافك."}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className={`group relative bg-white rounded-2xl border transition-all duration-200 ${
                  selectedService === service.id
                    ? "border-gray-900 shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onMouseEnter={() => setSelectedService(service.id)}
                onMouseLeave={() => setSelectedService(null)}
              >
                <div className="p-6 sm:p-8">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 mb-6 group-hover:border-gray-300 group-hover:bg-gray-100 transition-colors">
                    {service.icon}
                  </div>

                  {/* Title and Price */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {language === "en" ? service.name : service.nameAr}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                      <span className="text-sm text-gray-500">/ {language === "en" ? service.duration : service.durationAr}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {language === "en" ? service.description : service.descriptionAr}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {(language === "en" ? service.features : service.featuresAr).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleBookService(service.id)}
                    className="w-full h-11 px-4 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    {language === "en" ? "Book Now" : "احجز الآن"}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            {language === "en" ? "Frequently Asked Questions" : "الأسئلة الشائعة"}
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === "en" ? "How do I book a service?" : "كيف أحجز خدمة؟"}
              </h3>
              <p className="text-sm text-gray-600">
                {language === "en"
                  ? "Click 'Book Now' on any service, sign in to your account, fill out a brief questionnaire, and select your preferred time slot."
                  : "انقر على 'احجز الآن' على أي خدمة، سجل الدخول إلى حسابك، املأ استبيان موجز، واختر الوقت المفضل لديك."}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === "en" ? "What if I need to reschedule?" : "ماذا لو احتجت إلى إعادة الجدولة؟"}
              </h3>
              <p className="text-sm text-gray-600">
                {language === "en"
                  ? "You can reschedule up to 24 hours before your appointment. Contact us through your dashboard."
                  : "يمكنك إعادة الجدولة حتى 24 ساعة قبل موعدك. اتصل بنا من خلال لوحة التحكم الخاصة بك."}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === "en" ? "How are sessions conducted?" : "كيف تتم الجلسات؟"}
              </h3>
              <p className="text-sm text-gray-600">
                {language === "en"
                  ? "All sessions are conducted via video call. You'll receive a meeting link after booking."
                  : "تتم جميع الجلسات عبر مكالمة فيديو. ستتلقى رابط الاجتماع بعد الحجز."}
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

