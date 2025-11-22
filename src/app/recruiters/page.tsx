"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { employerTranslations } from "@/lib/language/employer";
import { 
  Sparkles, 
  Users, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle2,
  ArrowRight 
} from "lucide-react";
import CircularNavbar from "@/components/circular-navbar";

export default function RecruiterLandingPage() {
  const { language } = useLanguage();
  const t = employerTranslations[language];

  const features = [
    {
      icon: Sparkles,
      title: t.landingFeature1Title,
      description: t.landingFeature1Description,
    },
    {
      icon: Zap,
      title: t.landingFeature2Title,
      description: t.landingFeature2Description,
    },
    {
      icon: Users,
      title: t.landingFeature3Title,
      description: t.landingFeature3Description,
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: t.landingSaveTime,
      description: t.landingSaveTimeDescription,
    },
    {
      icon: Target,
      title: t.landingBetterMatches,
      description: t.landingBetterMatchesDescription,
    },
    {
      icon: CheckCircle2,
      title: t.landingEasyToUse,
      description: t.landingEasyToUseDescription,
    },
  ];

  return (
    <>
      <CircularNavbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles size={16} />
                <span>AI-Powered Recruitment</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                {t.landingHeroTitle}
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t.landingHeroSubtitle}
              </p>

              <div className="flex justify-center">
                <Link href="/auth/employer/signup">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                  >
                    {t.landingGetStarted}
                    <ArrowRight size={20} />
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                {t.landingAlreadyHaveAccount}{" "}
                <Link href="/auth/employer/login" className="text-primary font-medium hover:underline">
                  {t.landingSignIn}
                </Link>
              </p>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-8">
                {/* Dashboard Preview Mockup */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-2 bg-gray-100 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-5/6" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-100/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {t.landingWhyChooseUs}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50/50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white p-6">
                  {/* Employee Profile Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Candidate Profiles</h3>
                    
                    {/* Profile Card 1 */}
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-100/50 rounded-xl border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">Senior Software Engineer</div>
                          <div className="text-sm text-gray-600 mb-2">5+ years experience • React, Node.js</div>
                          <div className="flex gap-2">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">95% Match</span>
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Available Now</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Card 2 */}
                    <div className="p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl border border-purple-200/50">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">Product Designer</div>
                          <div className="text-sm text-gray-600 mb-2">3+ years experience • UI/UX, Figma</div>
                          <div className="flex gap-2">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">92% Match</span>
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Card 3 */}
                    <div className="p-4 bg-gradient-to-r from-pink-100/50 to-primary/10 rounded-xl border border-pink-200/50">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">Data Scientist</div>
                          <div className="text-sm text-gray-600 mb-2">4+ years experience • Python, ML</div>
                          <div className="flex gap-2">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">98% Match</span>
                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Top Talent</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        <span className="font-semibold text-primary">1000+</span> qualified candidates ready to join your team
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-purple-600 p-12 text-center text-white shadow-2xl"
            >
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Transform Your Hiring?
                </h2>
                <p className="text-xl mb-8 text-purple-100">
                  Join hundreds of companies finding their perfect candidates
                </p>
                <div className="flex justify-center">
                  <Link href="/auth/employer/signup">
                    <Button
                      size="lg"
                      className="gap-2 rounded-full px-8 py-6 text-lg bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all"
                    >
                      {t.landingGetStarted}
                      <ArrowRight size={20} />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-800/20 rounded-full translate-x-1/2 translate-y-1/2" />
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}

