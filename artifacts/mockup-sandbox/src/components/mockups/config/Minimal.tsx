const menuItems = [
  { icon: "◫", label: "Meus Bots",      badge: "1 Ativos",  color: "#7C3AED" },
  { icon: "⚡", label: "Comprar Moedas", badge: "",          color: "#F59E0B" },
  { icon: "☆",  label: "Ver Planos",     badge: "",          color: "#22C55E" },
];
const prefs = [
  { icon: "🔔", label: "Notificações",  color: "#3B82F6" },
  { icon: "🔒", label: "Segurança",     color: "#EF4444" },
  { icon: "❓", label: "Suporte",       color: "#6366F1" },
  { icon: "📋", label: "Termos de uso", color: "#9CA3AF" },
];

export function Minimal() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#111118] font-sans flex flex-col">
      <div className="px-6 pt-12 pb-5">
        <h1 className="text-[24px] font-bold text-white tracking-tight">Configurações</h1>
      </div>

      <div className="px-6 flex-1 space-y-5">
        {/* User Card */}
        <div className="bg-[#18181F] rounded-3xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/40">
            <span className="text-white text-[22px] font-bold">T</span>
          </div>
          <div className="flex-1">
            <p className="text-[17px] font-bold text-white">teste</p>
            <p className="text-[12px] text-[#505060] mt-0.5">62993736175</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#111118] border border-[#202028] flex items-center justify-center">
            <span className="text-[#505060] text-lg">⚙</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#18181F] rounded-3xl p-5">
            <p className="text-[10px] font-bold text-[#505060] tracking-[2px] mb-3">SALDO</p>
            <p className="text-[32px] font-extrabold text-white leading-none">30</p>
            <p className="text-[11px] text-[#505060] mt-2">Moedas disponíveis</p>
          </div>
          <div className="bg-[#18181F] rounded-3xl p-5">
            <p className="text-[10px] font-bold text-[#505060] tracking-[2px] mb-3">PLANO</p>
            <p className="text-[22px] font-extrabold text-[#8B5CF6] leading-none">Gratuito</p>
            <p className="text-[11px] text-[#505060] mt-2">Não há nenhum</p>
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
              <div
                key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${i < menuItems.length - 1 ? "border-b border-[#202028]" : ""}`}
              >
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color + "18" }}>
                  <span className="text-base" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <span className="flex-1 text-[15px] font-semibold text-white">{item.label}</span>
                {item.badge && (
                  <span className="text-[12px] font-semibold text-[#8B5CF6]">{item.badge}</span>
                )}
                <span className="text-[#303040] text-xl">›</span>
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
              <div
                key={item.label}
                className={`flex items-center gap-4 px-5 py-4 ${i < prefs.length - 1 ? "border-b border-[#202028]" : ""}`}
              >
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color + "18" }}>
                  <span className="text-base">{item.icon}</span>
                </div>
                <span className="flex-1 text-[15px] font-semibold text-white">{item.label}</span>
                <span className="text-[#303040] text-xl">›</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full border border-[#7C3AED]/30 rounded-2xl py-4 text-center">
          <span className="text-[15px] font-bold text-[#7C3AED]">Sair da conta</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#111118] border-t border-[#1C1C24] px-2 h-16 flex items-center mt-4 flex-shrink-0">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#404050] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#404050]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full bg-[#7C3AED] flex items-center justify-center border-4 border-[#111118] shadow-lg shadow-purple-700/40">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas"],["⚙","Config",true]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-[#8B5CF6]" : "text-[#404050]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-[#8B5CF6]" : "text-[#404050]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
