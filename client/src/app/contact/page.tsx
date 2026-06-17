"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/queries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, org, subject: "Contact Form Query", message })
        });
        if (res.ok) {
          setSubmitted(true);
          setName("");
          setEmail("");
          setOrg("");
          setMessage("");
        } else {
          alert("Failed to send message. Please try again later.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow pt-16 bg-surface-container-low/40">
        <section className="py-12 bg-white border-b border-outline-variant/30">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-2">
            <span className="text-secondary font-bold text-[12px] uppercase tracking-wider">
              Get in Touch
            </span>
            <h1 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
              Contact Us
            </h1>
            <p className="text-on-surface-variant text-[15px] max-w-xl">
              Have questions about our Report or want to collaborate? Send us a message.
            </p>
          </div>
        </section>

        <section className="max-w-container-max-width mx-auto px-gutter py-12">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Contact details card */}
            <div className="lg:col-span-5 w-full space-y-6">
              <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm space-y-6">
                <h3 className="font-plus-jakarta text-xl font-extrabold text-primary pb-3 border-b border-outline-variant/20">
                  Contact Information
                </h3>
                
                <div className="space-y-4 text-on-surface-variant text-[14px]">
                  <div className="flex gap-3.5 items-start">
                    <Mail size={18} className="text-secondary mt-0.5" />
                    <div>
                      <p className="font-bold text-primary">Email Research Queries</p>
                      <p>research@ccs.in</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <Phone size={18} className="text-secondary mt-0.5" />
                    <div>
                      <p className="font-bold text-primary">Phone Inquiries</p>
                      <p>+91-11-2653-7456/
                        <br />
                        26521882
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <MapPin size={18} className="text-secondary mt-0.5" />
                    <div>
                      <p className="font-bold text-primary">Centre for Civil Society</p>
                      <p className="leading-relaxed">
                        A-69, Hauz Khas, <br />
                        New Delhi - 110016, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm h-64 relative bg-surface-container-low">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.8931496152013!2d77.20840437526233!3d28.55329897570809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2134f81ff19%3A0x6053802de1118894!2sCentre%20for%20Civil%20Society!5e1!3m2!1sen!2sin!4v1781337668182!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Right Column: Contact form */}
            <div className="lg:col-span-7 w-full">
              <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-8 space-y-6">
                {submitted ? (
                  <div className="py-16 text-center space-y-4">
                    <CheckCircle size={48} className="text-green-600 mx-auto" />
                    <h3 className="font-plus-jakarta text-xl font-extrabold text-primary">
                      Thank You!
                    </h3>
                    <p className="text-on-surface-variant text-[14px] max-w-sm mx-auto">
                      Your message has been successfully sent to the CCS research lab. We will review your query and reply shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-primary text-white hover:bg-primary-container px-6 py-2.5 rounded-xl font-bold text-[13px] transition-colors shadow-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="font-plus-jakarta text-lg font-extrabold text-primary pb-3 border-b border-outline-variant/20">
                      Submit Query Form
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. Rajesh Kumar"
                          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/25"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rajesh@university.edu"
                          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/25"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Organization / University
                      </label>
                      <input
                        type="text"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        placeholder="Indian Institute of Technology (IIT)"
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/25"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Message / Query
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Detail your inquiry regarding scoring weights, indicator data sourcing, or partnerships..."
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/25 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-secondary text-white hover:bg-secondary-container font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-secondary/15 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Send size={15} />
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
