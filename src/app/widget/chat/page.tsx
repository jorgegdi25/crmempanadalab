"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Send, User, Phone, ShoppingBag, CheckCircle2, Loader2, Sparkles, MessageSquare, MapPin, Mail, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type Step = "welcome" | "name" | "country_selection" | "country_input" | "email" | "phone" | "interest" | "submitting" | "success" | "error";
type Lang = "es" | "en";

interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
}

const DICTIONARY = {
    es: {
        welcome: "¡Hola! 👋 Soy el asistente de Empanadas Lab.",
        askName: "¿Cómo te llamas?",
        niceToMeet: "¡Qué gusto saludarte, {name}! 😊",
        askCountry: "¿Desde qué país nos escribes?",
        askCountryManual: "Por favor, escribe el nombre de tu país:",
        askEmail: "¿Cuál es tu correo electrónico?",
        perfect: "¡Perfecto!",
        askPhone: "¿A qué número de WhatsApp podemos contactarte?",
        oneLastThing: "Una última cosa...",
        askInterest: "¿En cuál de nuestros productos estás interesado?",
        saving: "¡Excelente elección! Estoy guardando tus datos...",
        success: "¡Listo! Uno de nuestros asesores te contactará muy pronto.",
        error: "Ups, tuve un problema al guardar tus datos. Por favor intenta de nuevo.",
        inputName: "Tu nombre...",
        inputCountry: "Escribe tu país...",
        inputEmail: "Tu correo electrónico...",
        inputPhone: "Tu WhatsApp...",
        headerTitle: "Chat de Atención",
        online: "En línea ahora",
        sending: "Enviando...",
        checkPhone: "Hablar con un asesor",
        thanks: "¡Gracias!",
        sentMsg: "Tu información ha sido enviada con éxito.",
        poweredBy: "Powered by",
        invalidEmail: "Por favor ingresa un correo válido.",
        invalidPhone: "Por favor ingresa un número válido (mínimo 10 dígitos con código).",
        countries: {
            colombia: "🇨🇴 Colombia",
            usa: "🇺🇸 USA",
            canada: "🇨🇦 Canadá",
            spain: "🇪🇸 España",
            other: "🌍 Otro"
        }
    },
    en: {
        welcome: "Hello! 👋 I'm the assistant from Empanadas Lab.",
        askName: "What is your name?",
        niceToMeet: "Nice to meet you, {name}! 😊",
        askCountry: "Which country are you writing from?",
        askCountryManual: "Please type the name of your country:",
        askEmail: "What is your email address?",
        perfect: "Perfect!",
        askPhone: "What is your WhatsApp number?",
        oneLastThing: "One last thing...",
        askInterest: "Which of our products are you interested in?",
        saving: "Great choice! I'm saving your data...",
        success: "Done! One of our advisors will contact you very soon.",
        error: "Oops, I had a problem saving your data. Please try again.",
        inputName: "Your name...",
        inputCountry: "Type your country...",
        inputEmail: "Your email address...",
        inputPhone: "Your WhatsApp...",
        headerTitle: "Support Chat",
        online: "Online now",
        sending: "Sending...",
        checkPhone: "Talk to an advisor",
        thanks: "Thank you!",
        sentMsg: "Your information has been sent successfully.",
        poweredBy: "Powered by",
        invalidEmail: "Please enter a valid email.",
        invalidPhone: "Please enter a valid number (min 7 digits).",
        countries: {
            colombia: "🇨🇴 Colombia",
            usa: "🇺🇸 USA",
            canada: "🇨🇦 Canada",
            spain: "🇪🇸 Spain",
            other: "🌍 Other"
        }
    }
};

const BRANDS: Record<string, { name: string; products: string[]; askInterest?: string }> = {
    "colbrew": {
        name: "ColBrew Coffee",
        products: ["Elixir Original", "Nitro Infusion", "Flavored Collection", "Quiero ser Distribuidor", "Socio Estratégico / Inversión", "Otro"]
    },
    "chococol": {
        name: "ChocoCol",
        products: ["Agua de Coco", "Aceite de Coco", "Ser Distribuidor", "Alianzas o Inversión", "Otro"]
    },
    "empanadaspaisanas": {
        name: "Empanada Paisana",
        products: ["Empanadas", "Franquicias y Licenciamiento", "Alianzas o Inversión", "Otro"],
        askInterest: "¿En qué podemos asesorarte el día de hoy?"
    },
    "empanadaslab": {
        name: "Empanadas Lab",
        products: ["Nuevos Proyectos / Incubación", "Alianzas o Inversión", "Proyectos del Ecosistema", "Otro"]
    },
    "default": {
        name: "Empanadas Lab",
        products: ["Nuevos Proyectos / Incubación", "Alianzas o Inversión", "Proyectos del Ecosistema", "Otro"]
    }
};

function ChatWidgetContent() {
    const searchParams = useSearchParams();
    const sourceParam = searchParams.get("source") || "Chat Widget Web";

    // Determine Brand
    const sourceKey = sourceParam.toLowerCase().replace(/[^a-z0-9]/g, "");
    const currentBrand = BRANDS[sourceKey] || BRANDS.default;

    const primaryColorParam = searchParams.get("primary");
    const langParam = searchParams.get("lang") as Lang;
    const [lang, setLang] = useState<Lang>("es");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (langParam === "en" || langParam === "es") {
            setLang(langParam);
        } else if (typeof window !== "undefined") {
            setLang(navigator.language.startsWith("en") ? "en" : "es");
        }
        setMounted(true);
    }, [langParam]);

    const t = DICTIONARY[lang];

    // Validate hex color or use default orange
    const isValidHex = (hex: string | null) => hex && /^([0-9A-F]{3}){1,2}$/i.test(hex);
    const primaryColor = isValidHex(primaryColorParam) ? `#${primaryColorParam}` : "#ea580c"; // orange-600 default
    const primaryColorLight = isValidHex(primaryColorParam) ? `#${primaryColorParam}20` : "#ffedd5"; // orange-50 default with opacity
    const primaryColorDark = isValidHex(primaryColorParam) ? `#${primaryColorParam}E6` : "#c2410c"; // orange-700 approx

    const [step, setStep] = useState<Step>("welcome");
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        country: "",
        email: "",
        phone: "",
        product_interest: ""
    });
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Initial message
    useEffect(() => {
        if (!mounted) return;
        let isCancelled = false;
        const script = async () => {
            const welcomeMsg = t.welcome.replace("Empanadas Lab", currentBrand.name);
            await addBotMessage(welcomeMsg);
            if (isCancelled) return;

            // If user already entered name (step != welcome), don't ask for name
            setStep(current => {
                if (current === "welcome") {
                    addBotMessage(t.askName).then(() => {
                        setStep(s => s === "welcome" ? "name" : s);
                    });
                }
                return current;
            });
        };
        script();
        return () => { isCancelled = true; };
    }, [lang, mounted]); // Re-run if lang changes or component mounts

    const addBotMessage = async (text: string) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now(), text, sender: "bot" }]);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        let currentInput = inputValue.trim();

        // Validation Logic
        if (step === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(currentInput)) {
                await addBotMessage(t.invalidEmail);
                return;
            }
        }
        if (step === "phone") {
            // Auto-prepend country code if missing
            const countryCodes: Record<string, string> = {
                "Colombia": "+57",
                "USA": "+1",
                "Canada": "+1",
                "España": "+34"
            };

            // If it's a known country and input doesn't start with +, add code
            const code = countryCodes[formData.country];
            if (code && !currentInput.startsWith("+")) {
                currentInput = `${code} ${currentInput}`;
            }

            // Simple validation: Allow + and digits, min 10 chars (code + number)
            // Regex: Optional +, space, digits
            const phoneRegex = /^[+]?[\d\s-]{10,}$/;
            if (!phoneRegex.test(currentInput)) {
                await addBotMessage(t.invalidPhone);
                return;
            }
        }

        setMessages(prev => [...prev, { id: Date.now(), text: currentInput, sender: "user" }]);
        setInputValue("");

        if (step === "name" || step === "welcome") {
            setFormData(prev => ({ ...prev, name: currentInput }));
            await addBotMessage(t.niceToMeet.replace("{name}", currentInput));
            await addBotMessage(t.askCountry);
            setStep("country_selection");
        } else if (step === "country_input") {
            setFormData(prev => ({ ...prev, country: currentInput }));
            await addBotMessage(t.perfect);
            await addBotMessage(t.askEmail);
            setStep("email");
        } else if (step === "email") {
            setFormData(prev => ({ ...prev, email: currentInput }));
            await addBotMessage(t.askPhone);
            setStep("phone");
        } else if (step === "phone") {
            setFormData(prev => ({ ...prev, phone: currentInput }));
            await addBotMessage(t.oneLastThing);

            // Use custom question if available, otherwise default
            const interestQ = currentBrand.askInterest || t.askInterest;
            await addBotMessage(interestQ);

            setStep("interest");
        }
    };

    const handleCountrySelection = async (country: string) => {
        const displayText = country === "other" ? t.countries.other :
            country === "colombia" ? t.countries.colombia :
                country === "usa" ? t.countries.usa :
                    country === "canada" ? t.countries.canada :
                        t.countries.spain;

        setMessages(prev => [...prev, { id: Date.now(), text: displayText, sender: "user" }]);

        if (country === "other") {
            await addBotMessage(t.askCountryManual);
            setStep("country_input");
        } else {
            // Clean emojis for clean-ish data or keep them, let's keep clean name
            // Actually, keep it simple mapping values
            const countryMap: Record<string, string> = {
                colombia: "Colombia",
                usa: "USA",
                canada: "Canada",
                spain: "España"
            };
            setFormData(prev => ({ ...prev, country: countryMap[country] || country }));
            await addBotMessage(t.perfect);
            await addBotMessage(t.askEmail);
            setStep("email");
        }
    };

    const handleInterestSelection = async (interest: string) => {
        setMessages(prev => [...prev, { id: Date.now(), text: interest, sender: "user" }]);
        setFormData(prev => ({ ...prev, product_interest: interest }));
        setStep("submitting");

        await addBotMessage(t.saving);

        try {
            const finalData = {
                ...formData,
                product_interest: interest,
                source: sourceParam
            };

            const response = await fetch('/api/leads/external', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'emp_lab_secret_2026'
                },
                body: JSON.stringify(finalData)
            });

            if (response.ok) {
                await addBotMessage(t.success);
                setStep("success");
            } else {
                throw new Error('Failed to save lead');
            }
        } catch (error) {
            console.error(error);
            await addBotMessage(t.error);
            setStep("error");
        }
    };

    // Reemplaza con el número real de WhatsApp de la empresa
    const WHATSAPP_NUMBER = "573127697543"; // Usando el número real
    const WHATSAPP_MESSAGE = encodeURIComponent(
        lang === 'en'
            ? `Hello, I just left my details in the ${currentBrand.name} chat and would like to speak with an advisor. My name is ${formData.name}.`
            : `Hola, acabo de dejar mis datos en el chat de ${currentBrand.name} y me gustaría hablar con un asesor. Mi nombre es ${formData.name}.`
    );

    return (
        <div
            className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden border border-slate-200"
            style={{
                // @ts-ignore
                "--primary": primaryColor,
                "--primary-light": primaryColorLight,
                "--primary-dark": primaryColorDark,
                paddingBottom: "env(safe-area-inset-bottom, 0px)"
            } as React.CSSProperties}
        >
            {/* Header */}
            <div
                className="p-4 text-white flex items-center justify-between shadow-md z-10"
                style={{ backgroundColor: "var(--primary)" }}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-tight">{t.headerTitle}</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] opacity-80 font-medium">{t.online}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"
            >
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
                            m.sender === "bot"
                                ? "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                                : "text-white ml-auto rounded-br-none"
                        )}
                        style={m.sender === "user" ? { backgroundColor: "var(--primary)" } : {}}
                    >
                        {m.text}
                    </div>
                ))}

                {isTyping && (
                    <div className="bg-white border border-slate-100 text-slate-400 p-3 rounded-2xl rounded-bl-none w-fit shadow-sm flex gap-1">
                        <span className="h-1.5 w-1.5 bg-slate-200 rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                )}

                {step === "country_selection" && !isTyping && (
                    <div className="grid grid-cols-2 gap-2 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {["colombia", "usa", "canada", "spain", "other"].map((countryKey) => (
                            <button
                                key={countryKey}
                                onClick={() => handleCountrySelection(countryKey)}
                                className={cn(
                                    "bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-700 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all flex items-center justify-center gap-2 shadow-sm",
                                    countryKey === "other" && "col-span-2"
                                )}
                            >
                                <span className="truncate">
                                    {/* @ts-ignore */}
                                    {t.countries[countryKey]}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {step === "interest" && !isTyping && (
                    <div className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {currentBrand.products.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleInterestSelection(option)}
                                className="bg-white border border-slate-200 p-4 rounded-xl text-xs font-bold text-slate-700 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all text-left flex items-center justify-between group shadow-sm"
                            >
                                {option}
                                <ShoppingBag className="h-3 w-3 text-slate-300 group-hover:text-[var(--primary)]" />
                            </button>
                        ))}
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500 bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="font-bold text-slate-900">{t.thanks}</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-6">{t.sentMsg}</p>

                        <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-green-100 group"
                        >
                            <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            {t.checkPhone}
                        </a>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-100 shrink-0">
                <div className="p-3 px-4">
                    {step !== "success" && step !== "interest" && step !== "country_selection" && step !== "submitting" && (
                        <form onSubmit={handleSend} className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    {step === "name" ? <User className="h-4 w-4 text-slate-300" /> :
                                        step === "country_input" ? <MapPin className="h-4 w-4 text-slate-300" /> :
                                            step === "email" ? <Mail className="h-4 w-4 text-slate-300" /> :
                                                <Phone className="h-4 w-4 text-slate-300" />}
                                </div>
                                <input
                                    type={step === "phone" ? "tel" : (step === "email" ? "email" : "text")}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={
                                        step === "name" ? t.inputName :
                                            step === "country_input" ? t.inputCountry :
                                                step === "email" ? t.inputEmail :
                                                    t.inputPhone
                                    }
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-lg shrink-0"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    )}

                    {step === "submitting" && (
                        <div
                            className="flex items-center justify-center gap-2 py-3 font-bold text-sm"
                            style={{ color: "var(--primary)" }}
                        >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t.sending}
                        </div>
                    )}
                </div>
                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold pb-2">
                    {t.poweredBy} <span style={{ color: "var(--primary)" }}>Empanadas CRM</span>
                </p>
            </div>
        </div>
    );
}

export default function ChatWidget() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        }>
            <ChatWidgetContent />
        </Suspense>
    );
}
