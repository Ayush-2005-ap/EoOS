import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { BookOpen, Star, HelpCircle, Users, CheckCircle, Database } from "lucide-react";

export default function About() {
  const steps = [
    {
      step: 1,
      title: "Data Collection",
      desc: "Primary and secondary datasets are analyzed. Sub-indicators are objectively scored based on compliance and availability: Yes (1.0), Limited (0.5), or No (0.0).",
    },
    {
      step: 2,
      title: "Indicator Aggregation",
      desc: "Individual sub-indicator scores are mathematically combined to produce a unified score for each specific educational indicator, normalized across states.",
    },
    {
      step: 3,
      title: "Domain Score Computation",
      desc: "Indicators are grouped into our six core evaluation domains. Domain scores are derived through a geometric mean approach to ensure balanced performance requirement.",
    },
    {
      step: 4,
      title: "Weighted Final Score",
      desc: "Each domain is assigned a weight based on its critical impact on out-of-school populations. Final Score = Σ (Domain Score × Domain Weight).",
    },
    {
      step: 5,
      title: "State Ranking",
      desc: "Final sorting of all 36 states and Union Territories by their aggregate weighted scores to assign national rankings and percentile buckets.",
    },
  ];

  const domains = [
    { id: "01", name: "Ease of Regulatory Clarity,Predictability & Accessibility ", desc: "This domain assesses the extent to which school regulations are publicly available and accessible, particularly through the official State Education Department websites and related digital platforms. It also covers the extent to which laws are clear, stable, and rule-based, and supported by well-defined timelines, approving authorities and procedures." },
    { id: "02", name: "Ease of Regulatory Compliance ", desc: "This domain examines the procedural and administrative burden placed on private schools in order to comply with regulatory requirements." },
    { id: "03", name: "Ease of Operations without Arbitary Regulatory Action", desc: "This domain evaluates the extent to which school operations are protected from discretionary regulatory action through the presence of objectives safeguards and accountability mechanisms." },
    { id: "04", name: "Ease of Financial Mobiliation", desc: "This domain assess the degree of operational and managerial flexibility available to schools within the existing legal framework." },
    { id: "05", name: "Ease of School Lifecycle Operations", desc: "This domain evaluatres the regulatory requiremnts governing the establishment of new schools, expansion of existing institutions, and closure or exit of schools." },
    { id: "06", name: "Ease of Institutional Autonomy", desc: "This domain assesses the ability of schools to accumulate and allocate funds recieved for organizational use and investments." },
  ];

  const researchers = [
    {
      name: "Dr. Aruna Singh",
      role: "Director of Research",
      org: "Indian Institute of Policy Studies",
      desc: "Leading expert in education economics with over 20 years of experience in data modeling.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGeQmu30QhG5ZWayD5BTlpX6pLL6GgXcLaZlzQxE4-Cn0cLM1_9HF8GKmZecA4VD4hy9rRAfowDDfFRqhO_5BD4LNQHOgfX2pa14B3_kktnE2DH4nP1vW2oIQcFxahsxMxsSTFOz--R6DCaQ9pQ3Eps27VLTwY9HpT_nsxj_qi0Oqxcy49859Dh2DBlQxBLVwVrZLNbIHHUgWKg9wjuE7RVCHQcAMc-GUmda9URk1j1XMnERlfBOOmy7EZY33RpuesNz1tBmXvgc3A",
    },
    {
      name: "Vikram Malhotra",
      role: "Lead Data Scientist",
      org: "CCS Research Lab",
      desc: "Specializes in large-scale geospatial data analysis and socioeconomic indicators.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgzRIPpJuLDE25qEcXrjyF2QSOehqZeMXe_n1C6SZ_3qEzSAWUDso-bSvBzRG2ejcBPe34gtElpDH-EnYxM-WiwgHR3EZ591CoESrRStEwmef_kLwYvVNOEKyaNkbB0JvT2_x_akhMN7MUCsitXLnurLahnjw_jJKvu6WNibcLT8PItljnnyOewhWy6UKnxwOeBhO_nv5TK-XCzzNHTxbHsz7lA-5a9ncWZWdaRi_e0iwsFlOd7GY-SOOKxIf0QXScOQGN4kgOtwnA",
    },
    {
      name: "Dr. Priya Verma",
      role: "Senior Policy Advisor",
      org: "Global Education Council",
      desc: "Former education ministry advisor focused on bridge-school frameworks and child rights.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuPFulSo_f7gqTqPl4KzkIcK_JAl8nxqHQXWArHALr6cl2lGhzSaAwKFSMGa4zLAktfm-JSASlrCR7QqW4UqGHpNLiMFSGFLL5grMW9bldPsXkq3MQGF6TzuZv9Ly5xKEYc_MZGfPYdjjonUIIuTBZgp4RlUnUWBFuqQDZZ6gl7tjcvQIPzU9_yD2jzq5wQkYWghmsuMs4tNXqflLNRikokrNYRzi6zuZHxkG5M0auCYnQHQKcnWvdL5dcLx84By_nQ0_Ks9M2FbWC",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-surface-container-low py-24 border-b border-outline-variant/20">
          <div className="max-w-container-max-width mx-auto px-gutter text-center space-y-6">
            <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full font-semibold text-[13px]">
              About the Index
            </span>
            <h1 className="font-plus-jakarta text-4xl sm:text-5xl font-extrabold text-primary max-w-3xl mx-auto">
              Understanding the EoOS Index
            </h1>
            <p className="text-[16px] sm:text-[18px] leading-relaxed text-on-surface-variant max-w-4xl mx-auto">
              The Education Out-of-School (EoOS) Index is India’s first comprehensive framework designed to measure and rank states based on their progress in ensuring every child has access to quality education. Through data-driven insights, we aim to bridge the gap between policy intent and ground-level outcomes.
            </p>
          </div>
        </section>

        {/* Section 2: What is EoOS? */}
        <section className="py-24 bg-white">
          <div className="max-w-container-max-width mx-auto px-gutter flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-[60%] space-y-6">
              <h2 className="font-plus-jakarta text-3xl font-extrabold text-primary">
                What is the Education Out-of-School Index?
              </h2>
              <div className="space-y-4 text-on-surface-variant text-[15px] leading-relaxed">
                <p>
                  The EoOS Index serves as a critical diagnostic tool for the Indian education ecosystem. By moving beyond simple enrollment numbers, the index captures the nuanced realities of student retention, socioeconomic barriers, and systemic gaps that lead to children falling out of the formal schooling system.
                </p>
                <p>
                  Our methodology combines rigorous academic research with real-world policy application. We utilize primary data from national surveys and administrative records to create a multi-dimensional view of educational health across diverse geographies, from urban centers to remote rural districts.
                </p>
                <p>
                  Ultimately, the Index is not just a ranking; it is a roadmap for reform. It provides state governments with the evidence needed to allocate resources more effectively and implement interventions that are tailored to their specific educational challenges.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 bg-secondary/5 text-secondary px-5 py-3 rounded-xl border border-secondary/20">
                <CheckCircle size={18} />
                <span className="font-semibold text-[14px]">
                  First comprehensive state-level education ranking framework in India
                </span>
              </div>
            </div>

            <div className="lg:w-[40%] w-full">
              <div className="bg-primary p-8 rounded-2xl shadow-xl text-white space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-secondary-fixed">
                    <Database size={24} />
                  </div>
                  <div>
                    <div className="font-plus-jakarta text-xl font-bold">6 Domains</div>
                    <div className="text-[12px] text-on-primary-container font-semibold">Core Structural Pillars</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-secondary-fixed">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <div className="font-plus-jakarta text-xl font-bold">80+ Indicators</div>
                    <div className="text-[12px] text-on-primary-container font-semibold">Granular Data Points</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-secondary-fixed">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div className="font-plus-jakarta text-xl font-bold">36 States & UTs</div>
                    <div className="text-[12px] text-on-primary-container font-semibold">Nation-wide Coverage</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-secondary-fixed">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="font-plus-jakarta text-xl font-bold">Annual Edition</div>
                    <div className="text-[12px] text-on-primary-container font-semibold">Consistent Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Six Domains */}
        <section className="bg-surface-container-low py-24 border-t border-outline-variant/20">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-12">
            <h2 className="font-plus-jakarta text-3xl font-extrabold text-primary text-center">
              The Six Evaluation Domains
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="bg-white p-8 rounded-2xl border-b-4 border-secondary shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="text-secondary font-plus-jakarta font-extrabold text-2xl">
                    {domain.id}
                  </div>
                  <h3 className="font-plus-jakarta text-lg font-bold text-primary">
                    {domain.name}
                  </h3>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed">
                    {domain.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Methodology Timeline */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-gutter space-y-12">
            <h2 className="font-plus-jakarta text-3xl font-extrabold text-secondary text-center">
              How Rankings Are Calculated
            </h2>
            <div className="space-y-10">
              {steps.map((step) => (
                <div key={step.step} className="relative flex gap-6 step-line">
                  <div className="flex-none w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold z-10 shadow-md">
                    {step.step}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-plus-jakarta text-lg font-bold text-primary mb-1">
                      {step.title}
                    </h4>
                    <p className="text-on-surface-variant text-[14px] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Why It Matters  */}
        <section className="bg-surface-container-low py-24 border-y border-outline-variant/20">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-12">
            <h2 className="font-plus-jakarta text-3xl font-extrabold text-primary text-center">
              Why It Matters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                  <Star size={24} />
                </div>
                <h3 className="font-plus-jakarta text-xl font-bold text-primary">Policy Accountability</h3>
                <p className="text-on-surface-variant text-[14px] leading-relaxed">
                  Providing a metric-based look at policy efficacy, ensuring that legislative promises translate into tangible school improvements.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                  <HelpCircle size={24} />
                </div>
                <h3 className="font-plus-jakarta text-xl font-bold text-primary">State Benchmarking</h3>
                <p className="text-on-surface-variant text-[14px] leading-relaxed">
                  Enabling states to learn from peer success and challenges through comparative analysis and shared best practices.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/20 hover:-translate-y-1 transition-transform space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                  <Users size={24} />
                </div>
                <h3 className="font-plus-jakarta text-xl font-bold text-primary">Citizen Awareness</h3>
                <p className="text-on-surface-variant text-[14px] leading-relaxed">
                  Empowering communities with transparent data on local education, fostering a culture of informed civic participation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Research Team */}
        <section className="py-24 bg-white border-t border-outline-variant/20">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-12">
            <h2 className="font-plus-jakarta text-3xl font-extrabold text-primary text-center">
              The Research Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {researchers.map((person) => (
                <div
                  key={person.name}
                  className="bg-surface-container-low/50 p-8 rounded-2xl shadow-sm border border-outline-variant/30 text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden relative shadow-md">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-plus-jakarta text-lg font-bold text-primary">
                      {person.name}
                    </h4>
                    <div className="text-secondary font-semibold text-[13px]">{person.role}</div>
                    <div className="text-on-surface-variant text-[11px] font-medium uppercase tracking-wider">
                      {person.org}
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed">
                    {person.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
