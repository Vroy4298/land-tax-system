import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Minimal translations for the demo
const resources = {
    en: {
        translation: {
            "Dashboard": "Dashboard",
            "Properties": "Properties",
            "Map": "Map View",
            "Admin": "Admin",
            "Logout": "Logout",
            "Login": "Sign In",
            "Member Login": "Member Login",
            "Total Properties": "Total Properties",
            "Total Tax Paid": "Total Tax Paid",
            "Recent Properties": "Recent Properties",
            "Pay Now": "Pay Now"
        }
    },
    hi: {
        translation: {
            "Dashboard": "डैशबोर्ड",
            "Properties": "संपत्तियां",
            "Map": "मानचित्र दृश्य",
            "Admin": "व्यवस्थापक",
            "Logout": "लॉग आउट",
            "Login": "साइन इन",
            "Member Login": "सदस्य लॉगिन",
            "Total Properties": "कुल संपत्तियां",
            "Total Tax Paid": "कुल कर भुगतान",
            "Recent Properties": "हाल ही की संपत्तियां",
            "Pay Now": "अभी भुगतान करें"
        }
    },
    bn: {
        translation: {
            "Dashboard": "ড্যাশবোর্ড",
            "Properties": "সম্পত্তি",
            "Map": "মানচিত্র দৃশ্য",
            "Admin": "অ্যাডমিন",
            "Logout": "লগ আউট",
            "Login": "সাইন ইন",
            "Member Login": "সদস্য লগইন",
            "Total Properties": "মোট সম্পত্তি",
            "Total Tax Paid": "মোট কর প্রদান",
            "Recent Properties": "সাম্প্রতিক সম্পত্তি",
            "Pay Now": "এখন পরিশোধ করুন"
        }
    },
    mr: {
        translation: {
            "Dashboard": "डॅशबोर्ड",
            "Properties": "मालमत्ता",
            "Map": "नकाशा दृश्य",
            "Admin": "प्रशासक",
            "Logout": "लॉग आउट",
            "Login": "साइन इन",
            "Member Login": "सदस्य लॉगिन",
            "Total Properties": "एकूण मालमत्ता",
            "Total Tax Paid": "एकूण कर भरला",
            "Recent Properties": "अलीकडील मालमत्ता",
            "Pay Now": "आता भरा"
        }
    },
    te: {
        translation: {
            "Dashboard": "డాష్‌బోర్డ్",
            "Properties": "ఆస్తులు",
            "Map": "మ్యాప్ వీక్షణ",
            "Admin": "అడ్మిన్",
            "Logout": "లాగ్ అవుట్",
            "Login": "సైన్ ఇన్",
            "Member Login": "సభ్యుల లాగిన్",
            "Total Properties": "మొత్తం ఆస్తులు",
            "Total Tax Paid": "మొత్తం పన్ను చెల్లింపు",
            "Recent Properties": "ఇటీవలి ఆస్తులు",
            "Pay Now": "ఇప్పుడే చెల్లించండి"
        }
    },
    ta: {
        translation: {
            "Dashboard": "முகப்புப்பலகை",
            "Properties": "சொத்துக்கள்",
            "Map": "வரைபட பார்வை",
            "Admin": "நிர்வாகி",
            "Logout": "வெளியேறு",
            "Login": "உள்நுழை",
            "Member Login": "உறுப்பினர் உள்நுழைவு",
            "Total Properties": "மொத்த சொத்துக்கள்",
            "Total Tax Paid": "செலுத்தப்பட்ட மொத்த வரி",
            "Recent Properties": "சமீபத்திய சொத்துக்கள்",
            "Pay Now": "இப்போது செலுத்துங்கள்"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

export default i18n;
