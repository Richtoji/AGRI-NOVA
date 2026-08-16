"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { validateEmail, validatePhone } from "@/lib/validation";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitted(false);

    const trimmedName = name.trim();
    const trimmedContact = contactInfo.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName) {
      setValidationError("Full Name is required.");
      return;
    }

    const isEmail = validateEmail(trimmedContact);
    const isPhone = validatePhone(trimmedContact);

    if (!isEmail && !isPhone) {
      setValidationError("Please enter a valid email address or phone number.");
      return;
    }

    if (trimmedMsg.length < 10) {
      setValidationError("Message must be at least 10 characters long.");
      return;
    }

    setSubmitted(true);
    setName("");
    setContactInfo("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">24/7 Farmer & Enterprise Support</h1>
            <p className="text-xs text-gray-400">
              Have questions about AI crop models, equipment listings, or government scheme DBT transfers? Contact our support engineering team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-4xl mx-auto">
            
            {/* Info */}
            <div className="md:col-span-5 space-y-4">
              <Card className="space-y-4 border-gray-700/30">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-700/10 text-gray-600 border border-gray-700/30">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-gray-400">Kisan Toll-Free Helpline</div>
                    <div className="font-bold text-white">1800-180-1551 (Toll Free)</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-gray-400">Email Support</div>
                    <div className="font-bold text-white">support@agri-nova.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-gray-400">Headquarters</div>
                    <div className="font-bold text-white">Agri-Tech Park, Sector 62, Noida, UP</div>
                  </div>
                </div>
              </Card>
            </div>

             {/* Form */}
             <div className="md:col-span-7">
               <Card className="space-y-4 border-gray-800">
                 <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                   {validationError && (
                     <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center space-x-2">
                       <AlertCircle className="w-4 h-4" />
                       <span>{validationError}</span>
                     </div>
                   )}

                   <div>
                     <label className="block text-gray-300 font-semibold mb-1">Your Full Name</label>
                     <input
                       type="text"
                       required
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="e.g. Ramesh Singh"
                       className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-gray-700 focus:outline-none"
                     />
                   </div>
 
                   <div>
                     <label className="block text-gray-300 font-semibold mb-1">Email / Phone</label>
                     <input
                       type="text"
                       required
                       value={contactInfo}
                       onChange={(e) => setContactInfo(e.target.value)}
                       placeholder="e.g. support@agri-nova.com or +91 98765 43210"
                       className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-gray-700 focus:outline-none"
                     />
                   </div>
 
                   <div>
                     <label className="block text-gray-300 font-semibold mb-1">Message / Inquiry</label>
                     <textarea
                       required
                       rows={4}
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Describe your inquiry..."
                       className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-gray-700 focus:outline-none"
                     />
                   </div>
 
                   <Button type="submit" className="w-full">
                     <Send className="w-4 h-4 mr-2" />
                     <span>Send Message to Support</span>
                   </Button>
 
                   {submitted && (
                     <div className="p-3 rounded-xl bg-gray-700/10 border border-gray-700/30 text-gray-600 text-center font-bold flex items-center justify-center space-x-2">
                       <CheckCircle2 className="w-4 h-4" />
                       <span>Message received! Ticket #AG-9401 generated.</span>
                     </div>
                   )}
                 </form>
               </Card>
            </div>

          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
