
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ICONS, TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface AIInsiderProps {
  city: string;
  lang: Language;
}

const AIInsider: React.FC<AIInsiderProps> = ({ city, lang }) => {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = TRANSLATIONS[lang];

  const fetchTip = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = lang === 'de' 
        ? `Exklusiver Kurz-Tipp für Bamberg (Geheimtipp). Max 15 Wörter.`
        : `Exclusive short tip for ${city} (secret). Max 15 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Du bist ein lokaler Premium-Insider. Fass dich extrem kurz und nenne einen konkreten Ort oder eine Aktivität, die nicht offensichtlich ist."
        }
      });

      setTip(response.text || null);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, [city, lang]);

  return (
    <div className="bg-[#111] border border-gold/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.1)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <ICONS.Sparkle className="w-24 h-24 text-gold" />
      </div>
      
      <div className="flex items-start gap-4">
        <div className="bg-gold/10 p-3 rounded-2xl border border-gold/20 shrink-0">
          <ICONS.Sparkle className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h4 className="font-playfair font-bold text-gold text-sm uppercase tracking-widest mb-1">{t.aiTip}</h4>
          {loading ? (
            <div className="flex items-center gap-3 animate-pulse py-2">
              <div className="h-4 w-48 bg-white/5 rounded" />
            </div>
          ) : (
            <p className="text-white text-base leading-relaxed italic font-light">
              "{tip}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsider;
