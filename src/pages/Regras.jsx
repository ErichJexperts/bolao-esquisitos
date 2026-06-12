export default function Regras() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Regras e Prêmio</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Como funciona o bolão.</p>

        <div className="space-y-4">

          {/* Pontuação */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Pontuação</h2>

            {/* Tabela por fase */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
                <span>Fase</span>
                <span className="text-center text-green-600 dark:text-green-400">Placar exato</span>
                <span className="text-center text-blue-600 dark:text-blue-400">Resultado certo</span>
              </div>
              {[
                { fase: 'Fase de grupos',             exact: 3, correct: 1 },
                { fase: '32-avos → Quartas de final', exact: 4, correct: 2 },
                { fase: 'Semifinais',                 exact: 5, correct: 3 },
                { fase: 'Final',                      exact: 6, correct: 4 },
              ].map(({ fase, exact, correct }) => (
                <div key={fase} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{fase}</span>
                  <span className="text-center font-bold text-green-600 dark:text-green-400">+{exact} pts</span>
                  <span className="text-center font-bold text-blue-600 dark:text-blue-400">+{correct} pts</span>
                </div>
              ))}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-400 dark:text-gray-500">
                Resultado errado: <span className="font-semibold text-red-400">0 pts</span> em todas as fases
              </div>
            </div>

            {/* Cards explicativos */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Placar exato</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Acertou o placar completo. Ex: chutou 2×1 e deu 2×1.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">~</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Resultado correto</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Acertou quem ganhou (ou empate), mas errou o placar.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-red-400 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✗</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Resultado errado</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Errou o resultado. Melhor sorte da próxima.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regras gerais */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Regras gerais</h2>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600 shrink-0">—</span>Os palpites ficam abertos até o horário de início de cada partida.</li>
              <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600 shrink-0">—</span>Após o jogo começar, não é possível alterar ou enviar palpite.</li>
              <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600 shrink-0">—</span>Jogos sem palpite não geram pontos.</li>
              <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600 shrink-0">—</span>Em caso de empate na pontuação, o critério de desempate é o número de placares exatos.</li>
            </ul>
          </div>

          {/* Prêmio */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Prêmio 🏆</h2>
            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-5 py-4">
              <span className="text-3xl">🥇</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">1º lugar leva tudo</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">R$ 130,00</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
