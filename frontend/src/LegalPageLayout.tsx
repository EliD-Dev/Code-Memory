import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

interface LegalPageLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export const LegalPageLayout = ({ title, subtitle, children }: LegalPageLayoutProps) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-10 relative">
                {/* Back Button */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
                    >
                        <svg
                            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        <span>{t('legal.backHome')}</span>
                    </Link>
                </div>

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-slate-950 rounded-t-xl" />

                {/* Title */}
                <header className="mb-4 pb-6 border-b border-slate-100">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        {title}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {subtitle}
                    </p>
                </header>

                {/* Content */}
                <article className="prose prose-slate prose-sm max-w-none text-left leading-relaxed text-slate-700 space-y-6">
                    {children}
                </article>

                {/* Footer copy inside legal pages */}
                <footer className="border-t border-slate-100 pt-8 mt-12 text-center text-xs text-slate-400">
                    <p className="mb-2">
                        Copyright 2026 <a href="https://eli-dev.fr/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-950 font-semibold underline decoration-slate-400">EliDev</a>. {t('legal.copyright')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/mentions-legales" className="hover:text-slate-600 transition-colors">
                            {t('legal.links.mentions')}
                        </Link>
                        <Link to="/confidentialite" className="hover:text-slate-600 transition-colors">
                            {t('legal.links.privacy')}
                        </Link>
                        <Link to="/cgu" className="hover:text-slate-600 transition-colors">
                            {t('legal.links.cgu')}
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export const MentionsLegales = () => {
    const { t } = useTranslation();
    return (
        <LegalPageLayout
            title={t('legal.mentions.title')}
            subtitle={t('legal.mentions.subtitle')}
        >
            <section className="space-y-4" style={{ marginTop: '0' }}>
                <h3 className="text-lg font-bold text-slate-900" style={{ marginTop: '0' }}>{t('legal.mentions.section1Title')}</h3>
                <ReactMarkdown>{t('legal.mentions.section1Content')}</ReactMarkdown>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>{t('legal.mentions.siret')}</strong> 992 638 866 00010</li>
                    <li><strong>{t('legal.mentions.director')}</strong></li>
                </ul>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('legal.mentions.section2Title')}</h3>
                <p>
                    {t('legal.mentions.section2Content')}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <ReactMarkdown>{t('legal.mentions.hostingFrontend')}</ReactMarkdown>
                    </li>
                    <li>
                        <ReactMarkdown>{t('legal.mentions.hostingBackend')}</ReactMarkdown>
                    </li>
                </ul>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('legal.mentions.section3Title')}</h3>
                <p>
                    {t('legal.mentions.section3Content')}
                </p>
            </section>
        </LegalPageLayout>
    );
};

export const Confidentialite = () => {
    const { t } = useTranslation();
    return (
        <LegalPageLayout
            title={t('legal.privacy.title')}
            subtitle={t('legal.privacy.subtitle')}
        >
            <section className="space-y-4" style={{ marginTop: '0' }}>
                <h3 className="text-lg font-bold text-slate-900" style={{ marginTop: '0' }}>{t('legal.privacy.section1Title')}</h3>
                <p>
                    {t('legal.privacy.section1Content')}
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>{t('legal.privacy.pref1')}</li>
                    <li>{t('legal.privacy.pref2')}</li>
                    <li>{t('legal.privacy.pref3')}</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('legal.privacy.section2Title')}</h3>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-blue-900">
                    <p className="font-semibold mb-1" style={{ marginTop: '0' }}>{t('legal.privacy.section2WarningTitle')}</p>
                    <div className="text-xs leading-relaxed text-blue-900/90">
                        <ReactMarkdown>{t('legal.privacy.section2WarningContent')}</ReactMarkdown>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('legal.privacy.section3Title')}</h3>
                <p>
                    {t('legal.privacy.section3Content')}
                </p>
            </section>
        </LegalPageLayout>
    );
};

export const CGU = () => {
    const { t } = useTranslation();
    return (
        <LegalPageLayout
            title={t('legal.cgu.title')}
            subtitle={t('legal.cgu.subtitle')}
        >
            <section className="space-y-4" style={{ marginTop: '0' }}>
                <h3 className="text-lg font-bold text-slate-900" style={{ marginTop: '0' }}>{t('legal.cgu.section1Title')}</h3>
                <p>
                    {t('legal.cgu.section1Content')}
                </p>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('legal.cgu.section2Title')}</h3>
                <ReactMarkdown>{t('legal.cgu.section2Content')}</ReactMarkdown>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('legal.cgu.section3Title')}</h3>
                <ReactMarkdown>{t('legal.cgu.section3Content')}</ReactMarkdown>
            </section>
        </LegalPageLayout>
    );
};
