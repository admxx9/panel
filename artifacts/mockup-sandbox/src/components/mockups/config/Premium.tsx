const menuItems = [
  { icon: "◫", label: "Meus Bots",      badge: "1 Ativos",  accent: "#7C3AED" },
  { icon: "⚡", label: "Comprar Moedas", badge: "",          accent: "#F59E0B" },
  { icon: "☆",  label: "Ver Planos",     badge: "",          accent: "#22C55E" },
];
const prefs = [
  { icon: "🔔", label: "Notificações" },
  { icon: "🔒", label: "Segurança" },
  { icon: "❓", label: "Suporte" },
  { icon: "📋", label: "Termos de uso" },
];

export function Premium() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#0A0A10] font-sans flex flex-col">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-white">Configuracoes</h1>
      </div>

      <div className="px-5 flex-1 space-y-4">
        {/* User Card — gradient border effect */}
        <div className="rounded-2xl p-[1px]"
          style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3,#4F46E5)" }}>
          <div className="bg-[#111120] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3)" }}>
              <span className="text-white text-[18px] font-bold">T</span>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-white">teste</p>
              <p className="text-[12px] text-[#5A5A70]">62993736175</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1A1A2A] border border-[#252240] flex items-center justify-center">
              <span className="text-[#5A5A70] text-lg">⚙</span>
            </div>
          </div>
        </div>

        {/* Stats with left accent bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#141420] border border-[#252238] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "linear-gradient(180deg,#7C3AED,#4F46E5)" }} />
            <p className="text-[10px] font-bold text-[#5A5A70] tracking-widest mb-2 pl-1">SALDO</p>
            <p className="text-[26px] font-extrabold text-white leading-none pl-1">30</p>
            <p className="text-[11px] text-[#5A5A70] mt-1 pl-1">Moedas disponíveis</p>
          </div>
          <div className="bg-[#141420] border border-[#252238] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "linear-gradient(180deg,#A78BFA,#C026D3)" }} />
            <p className="text-[10px] font-bold text-[#5A5A70] tracking-widest mb-2 pl-1">PLANO</p>
            <p className="text-[19px] font-extrabold leading-none pl-1" style={{ background: "linear-gradient(135deg,#A78BFA,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gratuito</p>
            <p className="text-[11px] text-[#5A5A70] mt-1 pl-1">Não há nenhum</p>
          </div>
        </div>

        {/* SUA CONTA */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 rounded-full" style={{ background: "linear-gradient(180deg,#7C3AED,#4F46E5)" }} />
            <p className="text-[11px] font-bold text-[#5A5A70] tracking-[1.6px]">SUA CONTA</p>
          </div>
          <div className="bg-[#141420] border border-[#252238] rounded-2xl overflow-hidden">
            {menuItems.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < menuItems.length - 1 ? "border-b border-[#252238]" : ""}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.accent + "18", border: `1px solid ${item.accent}30` }}>
                  <span className="text-sm" style={{ color: item.accent }}>{item.icon}</span>
                </div>
                <span className="flex-1 text-[14px] font-medium text-white">{item.label}</span>
                {item.badge && (
                  <span className="text-[11px] font-bold bg-[#7C3AED]/15 text-[#A78BFA] px-2 py-0.5 rounded-full border border-[#7C3AED]/25 mr-1">
                    {item.badge}
                  </span>
                )}
                <span className="text-[#303050] text-lg">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3.5 rounded-full" style={{ background: "linear-gradient(180deg,#7C3AED,#4F46E5)" }} />
            <p className="text-[11px] font-bold text-[#5A5A70] tracking-[1.6px]">PREFERENCIAS</p>
          </div>
          <div className="bg-[#141420] border border-[#252238] rounded-2xl overflow-hidden">
            {prefs.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < prefs.length - 1 ? "border-b border-[#252238]" : ""}`}>
                <div className="w-8 h-8 rounded-xl bg-[#1A1A2A] border border-[#252238] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <span className="flex-1 text-[14px] font-medium text-white">{item.label}</span>
                <span className="text-[#303050] text-lg">›</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full rounded-2xl py-3.5 text-center" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.35)" }}>
          <span className="text-[14px] font-bold text-[#A78BFA]">Sair da conta</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#0A0A10] border-t border-[#1A1A28] px-2 h-16 flex items-center mt-4">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#3A3A50] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#3A3A50]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#0A0A10]"
            style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", boxShadow: "0 6px 20px rgba(124,58,237,0.45)" }}>
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas"],["⚙","Config",true]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1 relative">
            <span className={`text-xl ${on ? "text-[#A78BFA]" : "text-[#3A3A50]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-[#A78BFA]" : "text-[#3A3A50]"}`}>{lb}</span>
            {on && <div className="absolute bottom-0 w-1 h-1 rounded-full bg-[#7C3AED]" />}
          </div>
        ))}
      </div>
    </div>
  );
}
