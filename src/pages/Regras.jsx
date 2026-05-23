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
            <div className="space-y-3">
              <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4">
                <span className="text-lg font-bold text-green-600 dark:text-green-400 shrink-0 w-16">+3 pts</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Placar exato</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Acertou o placar completo. Ex: chutou 2×1 e deu 2×1.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 shrink-0 w-16">+1 pt</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Resultado correto</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Acertou quem ganhou (ou empate), mas errou o placar.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
                <span className="text-lg font-bold text-red-400 shrink-0 w-16">+0 pts</span>
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
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Caso a galera tope, cada participante contribui com <span className="font-semibold text-gray-900 dark:text-white">R$ 5,00</span>. O prêmio é dividido assim:
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3">
                <span className="text-xl">🥇</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">1º lugar — 70% do valor arrecadado</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ex: 10 participantes → R$ 35,00</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3">
                <span className="text-xl">🥈</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">2º lugar — 30% do valor arrecadado</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ex: 10 participantes → R$ 15,00</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
              <span>Alternativa:</span>
              <span className="text-gray-600 dark:text-gray-300">Pix fixo de <span className="font-semibold text-gray-900 dark:text-white">R$ 30,00</span> para o 1º lugar, independente do número de participantes.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
