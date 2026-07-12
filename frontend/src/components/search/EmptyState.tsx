'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function EmptyState() {
  const [faqOpen, setFaqOpen] = useState(false);

  const suggestions = [
    'Expand your date range',
    'Try a different location',
    'Remove some filters',
  ];

  const faqs = [
    {
      question: 'What if no dates work?',
      answer: 'Contact a host directly to discuss alternative dates or flexible booking options.',
    },
    {
      question: 'Why are there no results?',
      answer: 'Properties may be fully booked, or your filters might be too restrictive. Try adjusting your criteria.',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-6 py-12">
      {/* Main Message */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-ink mb-2">No properties found</h2>
        <p className="text-lg text-taupe">Try adjusting your search to find available properties</p>
      </div>

      {/* Suggestions */}
      <div className="bg-terracotta-tint border border-border rounded-card p-6 max-w-md w-full mb-8">
        <h3 className="font-sans font-semibold text-ink mb-3">Try these tips:</h3>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-terracotta font-bold mt-0.5">•</span>
              <span className="font-sans text-ink">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable FAQ */}
      <button
        onClick={() => setFaqOpen(!faqOpen)}
        className="flex items-center gap-2 px-4 py-2 text-terracotta hover:bg-terracotta-tint rounded-card transition-colors"
        aria-expanded={faqOpen}
      >
        <span className="font-sans font-semibold">Frequently Asked Questions</span>
        {faqOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* FAQ Content */}
      {faqOpen && (
        <div className="mt-6 max-w-md w-full space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-canvas rounded-card p-4 border border-border">
              <h4 className="font-sans font-semibold text-ink mb-2">{faq.question}</h4>
              <p className="font-sans text-taupe">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
