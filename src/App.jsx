import { useState } from 'react'
import { PlusCircle, List, Settings } from 'lucide-react'
import { AddWord } from './components/AddWord'
import { WordList } from './components/WordList'
import { SettingsScreen } from './components/SettingsScreen'
import { cn } from './lib/utils'

const TAB_ADD = 'add'
const TAB_LIST = 'list'
const TAB_SETTINGS = 'settings'

export default function App() {
  const [tab, setTab] = useState(TAB_ADD)

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <main className="safe-top">
        {tab === TAB_ADD && <AddWord />}
        {tab === TAB_LIST && <WordList />}
        {tab === TAB_SETTINGS && <SettingsScreen />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200/80 bg-white/95 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/95 dark:shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.3)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex justify-around px-2">
          <TabButton
            active={tab === TAB_ADD}
            onClick={() => setTab(TAB_ADD)}
            icon={PlusCircle}
            label="Add"
          />
          <TabButton
            active={tab === TAB_LIST}
            onClick={() => setTab(TAB_LIST)}
            icon={List}
            label="List"
          />
          <TabButton
            active={tab === TAB_SETTINGS}
            onClick={() => setTab(TAB_SETTINGS)}
            icon={Settings}
            label="Settings"
          />
        </div>
      </nav>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-1.5 py-3.5 text-xs font-semibold transition-all',
        active
          ? 'text-stone-900 dark:text-stone-100'
          : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-xl p-2 transition-all',
          active && 'bg-stone-200 dark:bg-stone-700'
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-stone-900 dark:bg-stone-100" />
      )}
    </button>
  )
}
