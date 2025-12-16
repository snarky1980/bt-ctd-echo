import React from 'react'
import { Globe } from 'lucide-react'
import echoLogo from '../../assets/echo-logo.svg'

export function Header({
  interfaceLanguage,
  setInterfaceLanguage,
  t,
}) {
  return (
    <header className="w-full mx-auto max-w-none page-wrap relative z-50 sticky top-0 border-b" style={{ backgroundColor: '#ffffff', borderColor: 'var(--tb-sage)', maxHeight: '120px', overflow: 'hidden', paddingTop: '0.125in', paddingBottom: '0px' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="banner-pill" style={{ top: '-48px', left: '-220px', width: '420px', height: '140px', background: '#2c3d50', opacity: 0.82, borderRadius: '160px' }}></div>
        <div className="banner-pill" style={{ top: '-23px', left: '720px', width: '340px', height: '115px', background: '#aca868', opacity: 0.40, borderRadius: '150px' }}></div>
        <div className="banner-pill" style={{ top: '-83px', left: '1140px', width: '680px', height: '125px', background: '#426388', opacity: 0.30, borderRadius: '160px' }}></div>
        <div className="banner-pill" style={{ top: '58px', left: '-200px', width: '380px', height: '110px', background: '#aca868', opacity: 0.30, borderRadius: '140px' }}></div>
        <div className="banner-pill" style={{ top: '65px', left: '780px', width: '720px', height: '185px', background: '#aca868', opacity: 0.15, borderRadius: '200px' }}></div>
        <div className="banner-pill" style={{ top: '85px', left: '1636px', width: '520px', height: '75px', background: '#2c3d50', opacity: 0.82, borderRadius: '130px' }}></div>
        <div className="hpill-line" style={{ left: '472px', top: '40px', height: '3px', width: '528px', background: '#2c3d50', opacity: 0.70 }}>
          <span className="hpill-dot" style={{ top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '18px', height: '18px', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 0 0 4px #aca868', position: 'absolute' }}></span>
        </div>
        <div className="hpill-line" style={{ left: '1530px', top: '-54px', height: '176px', width: '2px', background: '#2c3d50', opacity: 0.5 }}>
          <span className="hpill-dot" style={{ top: '52%', left: '50%', transform: 'translate(-50%, -50%)', width: '36px', height: '36px', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 0 0 4px #8a7530', position: 'absolute' }}></span>
        </div>
      </div>
      <div className="flex items-start justify-between relative">
        <div className="flex items-center space-x-6" style={{ marginLeft: '3in' }}>
          <div className="relative" style={{ width: '270px', height: '135px', marginTop: '-0.185in', marginBottom: '2px', marginLeft: '-100px' }}>
            <img src={echoLogo} alt="ECHO" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="flex flex-col justify-center" style={{ marginLeft: '-60px', marginTop: '19px' }}>
            <p className="font-semibold" style={{ color: 'rgba(44, 61, 80, 0.9)', fontSize: '100%', maxWidth: '22rem' }}>
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end" style={{ marginTop: '8px' }}>
          <div
            className="flex w-full max-w-sm flex-col gap-3 px-4 py-4 shadow-xl"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'calc(var(--radius) + 8px)' }}
          >
            <div className="flex items-center justify-between gap-0.5">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-white" />
                <span className="font-bold text-base text-white mr-[5px]">{t.interfaceLanguage}</span>
              </div>
              <div className="flex bg-white p-1 shadow-lg" style={{ borderRadius: '14px' }}>
                <button
                  onClick={() => setInterfaceLanguage('fr')}
                  className={`px-3 py-1.5 text-sm font-bold transition-all duration-300 transform ${
                    interfaceLanguage === 'fr' ? 'shadow-xl scale-105' : ''
                  }`}
                  style={
                    interfaceLanguage === 'fr'
                      ? { backgroundColor: '#2c3d50', color: 'white', borderRadius: 'calc(var(--radius) + 4px)' }
                      : { backgroundColor: 'transparent', borderRadius: 'calc(var(--radius) + 4px)', color: '#6b7280' }
                  }
                >
                  FR
                </button>
                <button
                  onClick={() => setInterfaceLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-bold transition-all duration-300 transform ${
                    interfaceLanguage === 'en' ? 'shadow-xl scale-105' : 'hover:scale-105'
                  }`}
                  style={
                    interfaceLanguage === 'en'
                      ? { backgroundColor: '#2c3d50', color: 'white', borderRadius: 'calc(var(--radius) + 4px)' }
                      : { backgroundColor: 'transparent', borderRadius: 'calc(var(--radius) + 4px)', color: '#6b7280' }
                  }
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
