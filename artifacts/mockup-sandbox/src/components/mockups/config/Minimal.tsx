/* Feather-style SVG icon helpers */
function Icon({ d, color = "#A78BFA", size = 16 }: { d: string; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Feather paths
const icons = {
  messageSquare: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  creditCard: "M1 4h22v16H1zM1 10h22",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  helpCircle: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm0-7v-1m0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v1M12 3v1m9 8h-1M4 12H3m15.36-5.36-.7.7M6.34 17.66l-.7.7M17.66 17.66l-.7-.7M6.34 6.34l-.7-.7",
  logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  chevronRight: "M9 18l6-6-6-6",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.38 2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z",
};

const menuItems = [
  { iconKey: "messageSquare", label: "Meus Bots",      badge: "1 Ativos",  accent: "#7C3AED" },
  { iconKey: "zap",           label: "Comprar Moedas", badge: "",          accent: "#F59E0B" },
  { iconKey: "creditCard",    label: "Ver Planos",     badge: "",          accent: "#22C55E" },
];
const prefs = [
  { iconKey: "bell",        label: "Notificações",     value: "Ativadas", accent: "#3B82F6" },
  { iconKey: "shield",      label: "Privacidade",      value: "",         accent: "#EF4444" },
  { iconKey: "helpCircle",  label: "Central de Ajuda", value: "",         accent: "#6366F1" },
];

export function Minimal() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#111118] font-sans flex flex-col">
      <div className="px-6 pt-12 pb-5">
        <h1 className="text-[24px] font-bold text-white tracking-tight">Configurações</h1>
      </div>

      <div className="px-6 flex-1 space-y-5 overflow-y-auto">
        {/* User Card */}
        <div className="bg-[#18181F] rounded-3xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg,#7C3AED,#9333EA)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
            <span className="text-white text-[22px] font-bold leading-none">T</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold text-white">teste</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon d={icons.phone} color="#505060" size={11} />
              <p className="text-[12px] text-[#505060]">62993736175</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#111118] border border-[#202028] flex items-center justify-center flex-shrink-0">
            <Icon d={icons.settings} color="#505060" size={17} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#18181F] rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
              style={{ background: "linear-gradient(180deg,#7C3AED,#4F46E5)" }} />
            <p className="text-[10px] font-bold text-[#505060] tracking-[2px] mb-3 pl-2">SALDO</p>
            <p className="text-[32px] font-extrabold text-white leading-none pl-2">30</p>
            <p className="text-[11px] text-[#505060] mt-2 pl-2">Moedas disponíveis</p>
          </div>
          <div className="bg-[#18181F] rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
              style={{ background: "linear-gradient(180deg,#A78BFA,#C026D3)" }} />
            <p className="text-[10px] font-bold text-[#505060] tracking-[2px] mb-3 pl-2">PLANO</p>
            <p className="text-[22px] font-extrabold text-[#8B5CF6] leading-none pl-2">Gratuito</p>
            <p className="text-[11px] text-[#505060] mt-2 pl-2">Não há nenhum</p>
          </div>
        </div>

        {/* SUA CONTA */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-[#7C3AED]" />
            <p className="text-[11px] font-bold tracking-[2px] text-[#505060]">SUA CONTA</p>
          </div>
          <div className="bg-[#18181F] rounded-3xl overflow-hidden">
            {menuItems.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${i < menuItems.length - 1 ? "border-b border-[#202028]" : ""}`}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.accent + "18", border: `1px solid ${item.accent}28` }}>
                  <Icon d={icons[item.iconKey as keyof typeof icons]} color={item.accent} size={15} />
                </div>
                <span className="flex-1 text-[15px] font-semibold text-white">{item.label}</span>
                {item.badge && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "#7C3AED18", color: "#A78BFA", border: "1px solid #7C3AED28" }}>
                    {item.badge}
                  </span>
                )}
                <Icon d={icons.chevronRight} color="#303040" size={16} />
              </div>
            ))}
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-[#7C3AED]" />
            <p className="text-[11px] font-bold tracking-[2px] text-[#505060]">PREFERENCIAS</p>
          </div>
          <div className="bg-[#18181F] rounded-3xl overflow-hidden">
            {prefs.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${i < prefs.length - 1 ? "border-b border-[#202028]" : ""}`}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.accent + "14", border: `1px solid ${item.accent}22` }}>
                  <Icon d={icons[item.iconKey as keyof typeof icons]} color={item.accent} size={15} />
                </div>
                <span className="flex-1 text-[15px] font-semibold text-white">{item.label}</span>
                {item.value && <span className="text-[12px] text-[#505060] mr-1">{item.value}</span>}
                <Icon d={icons.chevronRight} color="#303040" size={16} />
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="w-full rounded-3xl py-4 flex items-center justify-center gap-2.5"
          style={{ border: "1px solid #7C3AED30", background: "transparent" }}>
          <Icon d={icons.logOut} color="#7C3AED" size={16} />
          <span className="text-[15px] font-bold text-[#7C3AED]">Sair da conta</span>
        </button>

        <p className="text-center text-[10px] text-[#303040] tracking-widest pb-2">BOTALUGUEL PRO V1.0</p>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#111118] border-t border-[#1C1C24] px-2 h-16 flex items-center flex-shrink-0">
        {[
          { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", label: "Hub" },
          { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", label: "Bots" },
        ].map(item => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5">
            <Icon d={item.d} color="#404050" size={20} />
            <span className="text-[10px] font-semibold text-[#404050]">{item.label}</span>
          </div>
        ))}

        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full bg-[#7C3AED] flex items-center justify-center border-4 border-[#111118]"
            style={{ boxShadow: "0 6px 18px rgba(124,58,237,0.45)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>

        {[
          { d: icons.creditCard, label: "Moedas" },
          { d: icons.settings,   label: "Config", active: true },
        ].map(item => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5 relative">
            <Icon d={item.d} color={item.active ? "#8B5CF6" : "#404050"} size={20} />
            <span className={`text-[10px] font-semibold ${item.active ? "text-[#8B5CF6]" : "text-[#404050]"}`}>
              {item.label}
            </span>
            {item.active && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#7C3AED]" />}
          </div>
        ))}
      </div>
    </div>
  );
}
