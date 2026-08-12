"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FormInput } from "@/frontend/components/ui/FormInput";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 border-b border-surface-variant/30 pb-8">
          <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
            Contact & Support
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight">
            We&apos;re Here to Listen & Help
          </h1>
          <p className="text-xs text-on-surface-variant font-medium">
            Have questions, feedback, or need assistance with your sanctuary account? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Support Channels Info (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-5">
              <h3 className="font-heading font-extrabold text-lg text-on-surface">
                Support Channels
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-on-surface text-sm">General Support</h4>
                    <p className="text-on-surface-variant">support@manraah.com</p>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-mint/25 text-[#006B56] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">shield</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-on-surface text-sm">Privacy Officer</h4>
                    <p className="text-on-surface-variant">privacy@manraah.com</p>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Data requests & inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-peach/30 text-[#9E5D28] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">medical_services</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-on-surface text-sm">Therapist Partnerships</h4>
                    <p className="text-on-surface-variant">partners@manraah.com</p>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Licensed practitioner onboarding</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Immediate Crisis Callout Box */}
            <div className="p-5 rounded-[24px] bg-red-500/10 border border-red-500/20 space-y-2 text-xs text-red-900 font-medium">
              <h4 className="font-heading font-bold text-red-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">emergency</span>
                <span>In Immediate Danger?</span>
              </h4>
              <p className="leading-relaxed">
                If you are in immediate physical danger or contemplating self-harm, please visit our <Link href="/crisis" className="underline font-bold text-red-800">Crisis Helpline Directory</Link> or dial local emergency response services immediately.
              </p>
            </div>
          </div>

          {/* Interactive Form Card (Right) */}
          <div className="lg:col-span-7">
            <div className="p-7 sm:p-9 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-5">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-on-surface">
                    Message Received!
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out to Manraah. A member of our support team will respond to <strong>{email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="px-6 py-2.5 rounded-full bg-surface-container border border-surface-variant/40 font-heading font-bold text-xs text-on-surface hover:bg-primary/5 transition-colors mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading font-extrabold text-xl text-on-surface">
                    Send Us a Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <FormInput
                      label="Your Name"
                      sublabel="(Optional)"
                      type="text"
                      icon="person"
                      placeholder="Ashutosh Sahu"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <FormInput
                      label="Email Address"
                      type="email"
                      required
                      icon="mail"
                      placeholder="aanya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <FormInput
                    label="Subject"
                    type="text"
                    icon="chat_bubble"
                    placeholder="Feedback, Account Inquiry, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-heading font-bold text-on-surface">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we assist you today?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Message</span>
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
