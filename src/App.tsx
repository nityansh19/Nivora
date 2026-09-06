import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Menu,
  Moon,
  PiggyBank,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Wallet,
  X,
} from 'lucide-react';

type NavItem = { label: string; icon: typeof LayoutDashboard };

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Transactions', icon: CircleDollarSign },
  { label: 'Budget', icon: Wallet },
  { label: 'Savings', icon: PiggyBank },
  { label: 'Goals', icon: Target },
  { label: 'Analytics', icon: BarChart3 },
];

const quickActions = [
  { label: 'Expense', icon: ArrowDownRight },
  { label: 'Income', icon: ArrowUpRight },
  { label: 'Savings', icon: PiggyBank },
  { label: 'Goal', icon: Target },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function App() {
  const [active, setActive] = useState('Overview');
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [composer, setComposer] = useState<string | null>(null);

  const snapshot = useMemo(() => ({ balance: 0, income: 0, expenses: 0, saved: 0 }), []);

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}>
        <div className="brand-row">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">Nivora</div>
            <div className="brand-caption">Personal Finance OS</div>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="nav" aria-label="Primary navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={active === label ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setActive(label);
                setMobileOpen(false);
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item"><Bell size={18} strokeWidth={1.8} /><span>Notifications</span></button>
          <button className="nav-item"><Settings size={18} strokeWidth={1.8} /><span>Settings</span></button>
          <div className="profile-chip">
            <div className="avatar">N</div>
            <div className="profile-copy"><strong>Nityansh</strong><span>Personal workspace</span></div>
            <ChevronRight size={16} />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div>
              <div className="eyebrow">Sunday, September 6</div>
              <h1>{active === 'Overview' ? 'Good evening, Nityansh.' : active}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="search-button" aria-label="Search">
              <Search size={17} />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="avatar top-avatar" aria-label="Open profile">N</button>
          </div>
        </header>

        <div className="content">
          <section className="hero-row">
            <div>
              <p className="section-kicker">Financial snapshot</p>
              <p className="muted">A clear view of where your money stands.</p>
            </div>
            <button className="primary-button" onClick={() => setComposer('Expense')}>
              <Plus size={18} /> Add transaction
            </button>
          </section>

          <section className="stats-grid" aria-label="Financial snapshot">
            <StatCard label="Current balance" value={formatMoney(snapshot.balance)} icon={Wallet} accent="primary" />
            <StatCard label="Income" value={formatMoney(snapshot.income)} icon={ArrowUpRight} />
            <StatCard label="Expenses" value={formatMoney(snapshot.expenses)} icon={ArrowDownRight} />
            <StatCard label="Saved this month" value={formatMoney(snapshot.saved)} icon={PiggyBank} accent="success" />
          </section>

          <section className="workspace-grid">
            <div className="panel spending-panel">
              <div className="panel-header">
                <div><h2>Where your money goes</h2><p>Spending trends will appear as you add transactions.</p></div>
                <button className="text-button">This month <ChevronRight size={15} /></button>
              </div>
              <div className="empty-chart">
                <div className="chart-orbit"><BarChart3 size={25} /></div>
                <strong>Your spending story starts here.</strong>
                <span>Add your first expense to unlock your trends and category insights.</span>
                <button className="secondary-button" onClick={() => setComposer('Expense')}><Plus size={16} /> Add first expense</button>
              </div>
            </div>

            <div className="panel insight-panel">
              <div className="panel-header"><div><h2>Financial snapshot</h2><p>Built from your real activity.</p></div><Sparkles size={18} className="sparkle" /></div>
              <div className="insight-empty">
                <div className="insight-icon"><Sparkles size={18} /></div>
                <div><strong>Insights stay honest.</strong><p>Nivora will only surface patterns once it has enough real transaction data.</p></div>
              </div>
              <div className="divider" />
              <div className="mini-row"><span>Available to spend</span><strong>{formatMoney(snapshot.balance)}</strong></div>
              <div className="mini-row"><span>Savings rate</span><strong>—</strong></div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="panel">
              <div className="panel-header"><div><h2>Quick actions</h2><p>Keep daily tracking frictionless.</p></div></div>
              <div className="quick-actions">
                {quickActions.map(({ label, icon: Icon }) => (
                  <button key={label} className="quick-action" onClick={() => setComposer(label)}>
                    <span className="quick-icon"><Icon size={19} /></span><span>{label}</span><ChevronRight size={15} />
                  </button>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><div><h2>Recent activity</h2><p>Your latest transactions will live here.</p></div><CreditCard size={18} /></div>
              <div className="empty-list"><div className="empty-list-icon"><CircleDollarSign size={19} /></div><span>No transactions yet</span><small>Start with a single expense, income entry, or saving.</small></div>
            </div>
          </section>
        </div>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.slice(0, 4).map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setActive(label)}>
              <Icon size={19} /><span>{label}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence>
          {composer && (
            <motion.div className="composer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setComposer(null)}>
              <motion.div className="composer" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} onClick={(event) => event.stopPropagation()}>
                <div className="composer-header"><div><p className="eyebrow">Quick add</p><h2>{composer}</h2></div><button className="icon-button" onClick={() => setComposer(null)} aria-label="Close"><X size={18} /></button></div>
                <label>Amount<input inputMode="decimal" placeholder="₹ 0" autoFocus /></label>
                <div className="composer-two"><label>Category<select><option>Select category</option><option>Food</option><option>Transport</option><option>Shopping</option><option>Bills</option></select></label><label>Date<input type="date" /></label></div>
                <label>Note<input placeholder="What was this for?" /></label>
                <button className="primary-button full" onClick={() => setComposer(null)}>Save {composer.toLowerCase()}</button>
                <p className="form-note">Foundation only: persistence and server validation arrive with the transaction phase.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent = '' }: { label: string; value: string; icon: typeof Wallet; accent?: string }) {
  return (
    <motion.article className={`stat-card ${accent}`} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div>
      <strong>{value}</strong>
      <small>Ready for live data</small>
    </motion.article>
  );
}

export default App;
